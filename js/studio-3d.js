/**
 * Scarlet Roster — 3D Architectural Studio Engine
 * Interactive 3D Breeze Block Wall Simulator & Solar Shadow Play
 * Features: 35 Real Catalog Products, Real Procedural Voids, Texture Mapping, 
 * Sunlight Simulation, HD Snapshots, and Direct WhatsApp Architectural Specs.
 * Powered by Three.js & OrbitControls
 */

(function () {
    'use strict';

    // State Configuration
    const STATE = {
        mode: 'catalog',      // 'catalog' (Real 35 Products) or 'procedural' (3D Voids)
        selectedProduct: null, // Initialized to window.CATALOG_PRODUCTS[0]
        selectedProductId: 'R01',
        wallWidth: 3.0,       // meters (1.0m to 6.0m)
        wallHeight: 2.2,      // meters (1.0m to 3.6m)
        blockSize: 0.20,      // 20cm standard roster
        blockWidth: 0.10,     // 10cm physical width for Hemavara (or 20cm default)
        blockHeight: 0.20,    // 20cm physical height
        blockDepth: 0.10,     // 10cm depth
        mortarGap: 0.008,     // 8mm architectural joint
        bondType: 'running',  // 'running' (bata silang) or 'stack'
        currentMotif: 'hemavara', // for procedural mode
        currentMaterial: 'terracotta', // concrete, terracotta, white, charcoal
        
        // Solar light configuration
        azimuth: 55,          // degrees
        elevation: 26,        // degrees
        sunIntensity: 1.4,
        sunColor: '#FFF2DE',
        isNightMode: false,

        // Specifications
        totalPcs: 0,
        reservePcs: 0,
        areaM2: 0,
        weightKg: 0,
        totalCost: 0
    };

    // Three.js instances
    let scene, camera, renderer, controls;
    let instancedWallMesh = null;
    let floorMesh, interiorWallMesh;
    let sunLight, ambientLight, spotLightInterior;
    let materialsMap = {};
    let geometriesMap = {};
    let textureLoader;
    let catalogTextureCache = {};
    let proceduralConcreteTexture = null;

    // Procedural motif names
    const PROCEDURAL_MOTIF_NAMES = {
        square: 'Roster Geometris Minimalis (Square Void)',
        circle: 'Roster Terowongan Bulat (Circle O-Block)',
        cross: 'Roster Silang Berlian (Diamond Cross)',
        clover: 'Roster Motif Bunga 4 Daun (Four-Leaf Clover)',
        slits: 'Roster Louvre Strip Horizontal (Brise-Soleil)',
        dualslits: 'Roster Celah Ganda Vertikal (Dual Slits)',
        triangle: 'Roster Geometris Segitiga (Prism Modern)',
        diamond: 'Roster Belah Ketupat (Classic Diamond)'
    };

    const MATERIAL_NAMES = {
        concrete: 'Abu-abu Beton Semen Ekspos',
        terracotta: 'Terakota Tanah Liat Plered',
        white: 'Putih Bersih (White Cast Cement)',
        charcoal: 'Charcoal Dark Basalt'
    };

    /**
     * 1. Initialize 3D Studio Engine
     */
    function initStudio() {
        const container = document.getElementById('threejs-canvas-container');
        if (!container) return;

        // Initialize selected product from catalog
        if (window.CATALOG_PRODUCTS && window.CATALOG_PRODUCTS.length > 0) {
            STATE.selectedProduct = window.CATALOG_PRODUCTS[0];
            STATE.selectedProductId = STATE.selectedProduct.id;
            STATE.blockWidth = 0.10;
            STATE.blockHeight = 0.20;
            STATE.blockDepth = 0.10;
            STATE.currentMaterial = 'terracotta';
        }

        // Texture Loader
        textureLoader = new THREE.TextureLoader();

        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0F172A);
        scene.fog = new THREE.FogExp2(0x0F172A, 0.035);

        // Camera
        const aspect = container.clientWidth / container.clientHeight;
        camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
        camera.position.set(4.2, 2.5, 5.8);

        // Renderer with High Quality Shadows & Antialiasing
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true // Required for Snapshot export
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        container.appendChild(renderer.domElement);

        // OrbitControls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.maxPolarAngle = Math.PI / 2 - 0.02; // Keep camera above ground
        controls.minDistance = 1.5;
        controls.maxDistance = 24;
        controls.target.set(0, 1.1, 0);

        // Textures & Materials
        proceduralConcreteTexture = createProceduralConcreteTexture();
        initMaterials();

        // Architectural Floor & Space
        buildArchitecturalEnvironment();

        // Lighting System
        setupLighting();

        // Build Product Picker UI & Initial Wall
        renderCatalogProductPicker('all', '');
        buildWall();

        // Event Listeners
        setupUIEventListeners();

        // Render Loop
        animate();

        // Window Resize
        window.addEventListener('resize', onWindowResize);
    }

    /**
     * 2. Procedural Concrete Grain Texture
     */
    function createProceduralConcreteTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#CCCCCC';
        ctx.fillRect(0, 0, 512, 512);

        const imgData = ctx.getImageData(0, 0, 512, 512);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 32;
            const speckle = Math.random() < 0.04 ? (Math.random() - 0.5) * 50 : 0;
            const val = Math.min(255, Math.max(0, 204 + noise + speckle));
            data[i] = val;
            data[i + 1] = val;
            data[i + 2] = val;
        }
        ctx.putImageData(imgData, 0, 0);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(4, 4);
        return texture;
    }

    /**
     * 3. Architectural Materials Setup
     */
    function initMaterials() {
        // Concrete Grey
        materialsMap.concrete = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x9499A1),
            roughness: 0.88,
            metalness: 0.04,
            bumpMap: proceduralConcreteTexture,
            bumpScale: 0.002
        });

        // Natural Terracotta Clay
        materialsMap.terracotta = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xB5532F),
            roughness: 0.82,
            metalness: 0.02,
            bumpMap: proceduralConcreteTexture,
            bumpScale: 0.003
        });

        // Clean White Cement
        materialsMap.white = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xEFF1F5),
            roughness: 0.78,
            metalness: 0.05,
            bumpMap: proceduralConcreteTexture,
            bumpScale: 0.0015
        });

        // Charcoal Basalt Dark
        materialsMap.charcoal = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x272A30),
            roughness: 0.85,
            metalness: 0.06,
            bumpMap: proceduralConcreteTexture,
            bumpScale: 0.0025
        });
    }

    /**
     * 4. Architectural Environment Setup
     */
    function buildArchitecturalEnvironment() {
        // Floor Plane
        const floorGeo = new THREE.PlaneGeometry(36, 36);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x1E293B,
            roughness: 0.65,
            metalness: 0.1
        });
        floorMesh = new THREE.Mesh(floorGeo, floorMat);
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.position.y = 0;
        floorMesh.receiveShadow = true;
        scene.add(floorMesh);

        // Grid Lines
        const gridHelper = new THREE.GridHelper(30, 30, 0x334155, 0x1E293B);
        gridHelper.position.y = 0.002;
        scene.add(gridHelper);

        // Interior Back Wall (captures daylight projection through roster voids)
        const backWallGeo = new THREE.PlaneGeometry(36, 12);
        const backWallMat = new THREE.MeshStandardMaterial({
            color: 0x1E293B,
            roughness: 0.9,
            metalness: 0.02
        });
        interiorWallMesh = new THREE.Mesh(backWallGeo, backWallMat);
        interiorWallMesh.position.set(0, 6, -4.5);
        interiorWallMesh.receiveShadow = true;
        scene.add(interiorWallMesh);

        // Concrete Foundation Beam under Roster Wall
        const beamGeo = new THREE.BoxGeometry(8, 0.08, 0.35);
        const beamMat = new THREE.MeshStandardMaterial({
            color: 0x334155,
            roughness: 0.9
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.set(0, 0.04, 0);
        beam.receiveShadow = true;
        beam.castShadow = true;
        scene.add(beam);
    }

    /**
     * 5. Dynamic Lighting & Sunlight Path Simulation
     */
    function setupLighting() {
        ambientLight = new THREE.AmbientLight(0xC8D5E8, 0.45);
        scene.add(ambientLight);

        sunLight = new THREE.DirectionalLight(new THREE.Color(STATE.sunColor), STATE.sunIntensity);
        sunLight.castShadow = true;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 40;
        sunLight.shadow.camera.left = -7;
        sunLight.shadow.camera.right = 7;
        sunLight.shadow.camera.top = 7;
        sunLight.shadow.camera.bottom = -7;
        sunLight.shadow.bias = -0.0004;
        scene.add(sunLight);

        spotLightInterior = new THREE.SpotLight(0xFFA953, 0);
        spotLightInterior.position.set(0, 0.2, 1.8);
        spotLightInterior.target.position.set(0, 1.2, 0);
        spotLightInterior.angle = Math.PI / 4;
        spotLightInterior.penumbra = 0.6;
        spotLightInterior.castShadow = true;
        scene.add(spotLightInterior);
        scene.add(spotLightInterior.target);

        updateSunPosition();
    }

    function updateSunPosition() {
        if (STATE.isNightMode) {
            sunLight.intensity = 0.05;
            ambientLight.intensity = 0.2;
            spotLightInterior.intensity = 3.5;
            scene.background.set(0x05070D);
            scene.fog.color.set(0x05070D);
            return;
        }

        spotLightInterior.intensity = 0;
        scene.background.set(0x0F172A);
        scene.fog.color.set(0x0F172A);

        const radAz = (STATE.azimuth * Math.PI) / 180;
        const radEl = (STATE.elevation * Math.PI) / 180;
        const dist = 14;

        const x = dist * Math.cos(radEl) * Math.sin(radAz);
        const y = dist * Math.sin(radEl);
        const z = dist * Math.cos(radEl) * Math.cos(radAz);

        sunLight.position.set(x, y, z);
        sunLight.color.set(STATE.sunColor);
        sunLight.intensity = STATE.sunIntensity;
    }

    /**
     * 6. Product Texture Loader & Cache
     */
    function getProductTexture(imagePath) {
        if (catalogTextureCache[imagePath]) {
            return catalogTextureCache[imagePath];
        }
        const tex = textureLoader.load(imagePath, () => {
            if (instancedWallMesh && STATE.mode === 'catalog') {
                if (Array.isArray(instancedWallMesh.material)) {
                    instancedWallMesh.material.forEach(m => { m.needsUpdate = true; });
                } else if (instancedWallMesh.material) {
                    instancedWallMesh.material.needsUpdate = true;
                }
            }
        });
        tex.anisotropy = 4;
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        catalogTextureCache[imagePath] = tex;
        return tex;
    }

    /**
     * Merge multiple BufferGeometries into a single high-performance geometry
     */
    function mergeBufferGeometries(geometries) {
        if (!geometries || geometries.length === 0) return new THREE.BufferGeometry();
        if (geometries.length === 1) return geometries[0].clone();

        let totalVertices = 0;
        let totalIndices = 0;

        for (let i = 0; i < geometries.length; i++) {
            const g = geometries[i];
            totalVertices += g.attributes.position.count;
            if (g.index) totalIndices += g.index.count;
        }

        const positions = new Float32Array(totalVertices * 3);
        const normals = new Float32Array(totalVertices * 3);
        const uvs = new Float32Array(totalVertices * 2);
        const indices = totalIndices > 0 ? new Uint32Array(totalIndices) : null;

        let posOffset = 0;
        let normalOffset = 0;
        let uvOffset = 0;
        let indexOffset = 0;
        let vertexOffset = 0;

        for (let i = 0; i < geometries.length; i++) {
            const g = geometries[i];
            const pos = g.attributes.position.array;
            positions.set(pos, posOffset);
            posOffset += pos.length;

            if (g.attributes.normal) {
                normals.set(g.attributes.normal.array, normalOffset);
                normalOffset += g.attributes.normal.array.length;
            }

            if (g.attributes.uv) {
                uvs.set(g.attributes.uv.array, uvOffset);
                uvOffset += g.attributes.uv.array.length;
            }

            if (g.index && indices) {
                const idx = g.index.array;
                for (let j = 0; j < idx.length; j++) {
                    indices[indexOffset + j] = idx[j] + vertexOffset;
                }
                indexOffset += idx.length;
            }

            vertexOffset += g.attributes.position.count;
        }

        const merged = new THREE.BufferGeometry();
        merged.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
        merged.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        if (indices) merged.setIndex(new THREE.BufferAttribute(indices, 1));
        merged.computeVertexNormals();
        return merged;
    }

    /**
     * Authentic 1:1 3D Geometry for Roster Hemavara (R01)
     * Recreates the exact physical acoustic louver baffle blade (slanted center) & 45° angled sills from images/roster_1.jpg
     */
    function createAuthenticHemavaraGeometry(width = 0.10, height = 0.20, depth = 0.10) {
        const hw = width / 2;
        const hh = height / 2;
        const hd = depth / 2;

        const rimX = 0.015;
        const rimY = 0.020;
        const cavX1 = -hw + rimX; // -0.035
        const cavX2 = hw - rimX;  // +0.035
        const cavY1 = -hh + rimY; // -0.080
        const cavY2 = hh - rimY;  // +0.080
        const cavH = cavY2 - cavY1; // 0.160m

        const parts = [];

        // 1. Outer bevelled frame with rectangular hollow cavity
        const frameShape = new THREE.Shape();
        frameShape.moveTo(-hw, -hh);
        frameShape.lineTo(hw, -hh);
        frameShape.lineTo(hw, hh);
        frameShape.lineTo(-hw, hh);
        frameShape.closePath();

        const cavityHole = new THREE.Path();
        const cr = 0.002;
        cavityHole.moveTo(cavX1 + cr, cavY1);
        cavityHole.lineTo(cavX2 - cr, cavY1);
        cavityHole.quadraticCurveTo(cavX2, cavY1, cavX2, cavY1 + cr);
        cavityHole.lineTo(cavX2, cavY2 - cr);
        cavityHole.quadraticCurveTo(cavX2, cavY2, cavX2 - cr, cavY2);
        cavityHole.lineTo(cavX1 + cr, cavY2);
        cavityHole.quadraticCurveTo(cavX1, cavY2, cavX1, cavY2 - cr);
        cavityHole.lineTo(cavX1, cavY1 + cr);
        cavityHole.quadraticCurveTo(cavX1, cavY1, cavX1 + cr, cavY1);
        cavityHole.closePath();
        frameShape.holes.push(cavityHole);

        const frameExtrudeSettings = {
            depth: depth,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.0025,
            bevelThickness: 0.0025
        };
        const frameGeom = new THREE.ExtrudeGeometry(frameShape, frameExtrudeSettings);
        frameGeom.center();
        parts.push(frameGeom);

        // 2. The Angled Acoustic Louver Blade (Sirip Tengah Miring / Slanted Baffle)
        // Defined in X-Z plane, then extruded along Y and oriented into cavity
        const bladeShape = new THREE.Shape();
        const bzFront = hd - 0.003;  // +0.047
        const bzBack = -hd + 0.003; // -0.047

        // Blade coordinates in X-Z:
        // Front ridge: x from -0.010 to -0.002
        // Back edge:   x from -0.010 to +0.016
        // Right face slopes diagonally: (-0.002, bzFront) to (+0.016, bzBack) -> "yang tengahnya miring"
        const bx_front_left = -0.010;
        const bx_front_right = -0.002;
        const bx_back_left = -0.010;
        const bx_back_right = +0.016;

        bladeShape.moveTo(bx_front_left, bzFront);
        bladeShape.lineTo(bx_front_right, bzFront);
        bladeShape.lineTo(bx_back_right, bzBack);
        bladeShape.lineTo(bx_back_left, bzBack);
        bladeShape.closePath();

        const bladeExtrudeSettings = {
            depth: cavH + 0.002, // slightly overlap into frame sills for clean join
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.0015,
            bevelThickness: 0.0015
        };
        const bladeGeom = new THREE.ExtrudeGeometry(bladeShape, bladeExtrudeSettings);
        bladeGeom.center();
        bladeGeom.rotateX(Math.PI / 2);
        parts.push(bladeGeom);

        // 3. Bottom 45° Acoustic Sill Ramp (Triangular Wedge in Right Slot)
        const rxStart = bx_front_right;
        const rxEnd = cavX2;
        const rw = rxEnd - rxStart;

        const bottomRampShape = new THREE.Shape();
        bottomRampShape.moveTo(bzFront, cavY1);
        bottomRampShape.lineTo(0.005, cavY1 + 0.035);
        bottomRampShape.lineTo(0.005, cavY1);
        bottomRampShape.closePath();

        const bottomRampGeom = new THREE.ExtrudeGeometry(bottomRampShape, {
            depth: rw,
            bevelEnabled: false
        });
        bottomRampGeom.rotateY(Math.PI / 2);
        bottomRampGeom.translate(rxStart, 0, 0);
        parts.push(bottomRampGeom);

        // 4. Top 45° Acoustic Ceiling Ramp (Triangular Wedge in Right Slot)
        const topRampShape = new THREE.Shape();
        topRampShape.moveTo(bzFront, cavY2);
        topRampShape.lineTo(0.005, cavY2 - 0.035);
        topRampShape.lineTo(0.005, cavY2);
        topRampShape.closePath();

        const topRampGeom = new THREE.ExtrudeGeometry(topRampShape, {
            depth: rw,
            bevelEnabled: false
        });
        topRampGeom.rotateY(Math.PI / 2);
        topRampGeom.translate(rxStart, 0, 0);
        parts.push(topRampGeom);

        // 5. Merge all parts into unified geometry
        const unifiedGeom = mergeBufferGeometries(parts);
        parts.forEach(p => p.dispose());
        return unifiedGeom;
    }

    /**
     * Authentic 1:1 3D Geometry for Roster Lingkaran Retro (R05)
     * Recreates the funnel-chamfer circular tunnel breeze block from images/roster_5.jpg
     */
    function createAuthenticLingkaranRetroGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.006;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh);
        shape.lineTo(hw, -hh);
        shape.lineTo(hw, hh);
        shape.lineTo(-hw, hh);
        shape.closePath();

        // Central circular tunnel through-hole
        const hole = new THREE.Path();
        hole.absarc(0, 0, 0.062, 0, Math.PI * 2, true);
        shape.holes.push(hole);

        const extrudeSettings = {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 3,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        };
        const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geom.center();
        return geom;
    }

    /**
     * Authentic 1:1 3D Geometry for Roster Kotak 4 Lubang (R11)
     * Recreates the Bauhaus 4-square geometric breeze block from images/roster_11.png
     */
    function createAuthenticKotak4Geometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh);
        shape.lineTo(hw, -hh);
        shape.lineTo(hw, hh);
        shape.lineTo(-hw, hh);
        shape.closePath();

        const holeHalf = 0.027; // 5.4cm square void
        const r = 0.004; // 4mm fillet radius
        const offsets = [-0.046, 0.046];

        offsets.forEach(cx => {
            offsets.forEach(cy => {
                const hole = new THREE.Path();
                const x1 = cx - holeHalf, x2 = cx + holeHalf;
                const y1 = cy - holeHalf, y2 = cy + holeHalf;
                hole.moveTo(x1 + r, y1);
                hole.lineTo(x2 - r, y1);
                hole.quadraticCurveTo(x2, y1, x2, y1 + r);
                hole.lineTo(x2, y2 - r);
                hole.quadraticCurveTo(x2, y2, x2 - r, y2);
                hole.lineTo(x1 + r, y2);
                hole.quadraticCurveTo(x1, y2, x1, y2 - r);
                hole.lineTo(x1, y1 + r);
                hole.quadraticCurveTo(x1, y1, x1 + r, y1);
                hole.closePath();
                shape.holes.push(hole);
            });
        });

        const extrudeSettings = {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        };
        const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geom.center();
        return geom;
    }

    /**
     * Authentic 1:1 3D Geometry for Roster Silang Diagonal (R07)
     * Recreates the diagonal acoustic baffle bar with triangular through-voids from images/roster_7.jpg
     */
    function createAuthenticSilangGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh);
        shape.lineTo(hw, -hh);
        shape.lineTo(hw, hh);
        shape.lineTo(-hw, hh);
        shape.closePath();

        const rim = 0.024;
        const barHalf = 0.016; // 3.2cm diagonal acoustic bar
        const xMin = -hw + rim, xMax = hw - rim;
        const yMin = -hh + rim, yMax = hh - rim;

        // Top-Left Triangular Void
        const holeTL = new THREE.Path();
        holeTL.moveTo(xMin, yMin + (barHalf * 2.8));
        holeTL.lineTo(xMin, yMax);
        holeTL.lineTo(xMax - (barHalf * 2.8), yMax);
        holeTL.lineTo(xMin, yMin + (barHalf * 2.8));
        holeTL.closePath();
        shape.holes.push(holeTL);

        // Bottom-Right Triangular Void
        const holeBR = new THREE.Path();
        holeBR.moveTo(xMin + (barHalf * 2.8), yMin);
        holeBR.lineTo(xMax, yMin);
        holeBR.lineTo(xMax, yMax - (barHalf * 2.8));
        holeBR.lineTo(xMin + (barHalf * 2.8), yMin);
        holeBR.closePath();
        shape.holes.push(holeBR);

        const extrudeSettings = {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        };
        const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geom.center();
        return geom;
    }

    /**
     * Authentic 1:1 3D Geometry for Roster Kotak Polos (R27)
     * Recreates the modern large-aperture single square void
     */
    function createAuthenticKotakPolosGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh);
        shape.lineTo(hw, -hh);
        shape.lineTo(hw, hh);
        shape.lineTo(-hw, hh);
        shape.closePath();

        const holeHalf = 0.065; // 13x13cm opening
        const r = 0.006;
        const hole = new THREE.Path();
        const x1 = -holeHalf, x2 = holeHalf;
        const y1 = -holeHalf, y2 = holeHalf;
        hole.moveTo(x1 + r, y1);
        hole.lineTo(x2 - r, y1);
        hole.quadraticCurveTo(x2, y1, x2, y1 + r);
        hole.lineTo(x2, y2 - r);
        hole.quadraticCurveTo(x2, y2, x2 - r, y2);
        hole.lineTo(x1 + r, y2);
        hole.quadraticCurveTo(x1, y2, x1, y2 - r);
        hole.lineTo(x1, y1 + r);
        hole.quadraticCurveTo(x1, y1, x1 + r, y1);
        hole.closePath();
        shape.holes.push(hole);

        const extrudeSettings = {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        };
        const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geom.center();
        return geom;
    }

    /**
     * Authentic 1:1 3D Geometry for Roster Motif Kampak (R02)
     * 10 x 30 x 10 cm vertical block with stepped axe blade & sloping hopper from images/roster_2.jpg
     */
    function createAuthenticKampakGeometry(width = 0.10, height = 0.30, depth = 0.10) {
        const hw = width / 2;
        const hh = height / 2;

        const rimX = 0.016;
        const rimY = 0.022;
        const cavX1 = -hw + rimX; // -0.034
        const cavX2 = hw - rimX;  // +0.034
        const cavY1 = -hh + rimY; // -0.128
        const cavY2 = hh - rimY;  // +0.128
        const cavH = cavY2 - cavY1; // 0.256m
        const cavW = cavX2 - cavX1; // 0.068m

        const parts = [];

        // 1. Outer bevelled frame with rectangular cavity
        const frameShape = new THREE.Shape();
        frameShape.moveTo(-hw, -hh);
        frameShape.lineTo(hw, -hh);
        frameShape.lineTo(hw, hh);
        frameShape.lineTo(-hw, hh);
        frameShape.closePath();

        const cavityHole = new THREE.Path();
        const cr = 0.003;
        cavityHole.moveTo(cavX1 + cr, cavY1);
        cavityHole.lineTo(cavX2 - cr, cavY1);
        cavityHole.quadraticCurveTo(cavX2, cavY1, cavX2, cavY1 + cr);
        cavityHole.lineTo(cavX2, cavY2 - cr);
        cavityHole.quadraticCurveTo(cavX2, cavY2, cavX2 - cr, cavY2);
        cavityHole.lineTo(cavX1 + cr, cavY2);
        cavityHole.quadraticCurveTo(cavX1, cavY2, cavX1, cavY2 - cr);
        cavityHole.lineTo(cavX1, cavY1 + cr);
        cavityHole.quadraticCurveTo(cavX1, cavY1, cavX1 + cr, cavY1);
        cavityHole.closePath();
        frameShape.holes.push(cavityHole);

        const frameGeom = new THREE.ExtrudeGeometry(frameShape, {
            depth: depth,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.0025,
            bevelThickness: 0.0025
        });
        frameGeom.center();
        parts.push(frameGeom);

        // 2. Kampak Lower Vertical Blade Block (Mata Kampak)
        const bladeW = cavW * 0.62; // ~4.2cm wide
        const bladeH = (cavH / 2) + 0.005;
        const bladeD = depth - 0.006;
        const bladeGeom = new THREE.BoxGeometry(bladeW, bladeH, bladeD);
        bladeGeom.translate(cavX1 + (bladeW / 2), cavY1 + (bladeH / 2), 0);
        parts.push(bladeGeom);

        // 3. Upper Sloping Hopper Wedge (Corong Miring Atas)
        const rampShape = new THREE.Shape();
        rampShape.moveTo(cavX1, cavY2);
        rampShape.lineTo(cavX1 + bladeW, 0.005);
        rampShape.lineTo(cavX1, 0.005);
        rampShape.closePath();

        const rampGeom = new THREE.ExtrudeGeometry(rampShape, {
            depth: bladeD,
            bevelEnabled: false
        });
        rampGeom.center();
        rampGeom.translate(cavX1 + (bladeW / 2) - 0.003, cavY2 - (bladeH / 2) + 0.002, 0);
        parts.push(rampGeom);

        const unified = mergeBufferGeometries(parts);
        parts.forEach(p => p.dispose());
        return unified;
    }

    /**
     * Authentic 1:1 3D Geometry for Roster Minimalis Strip / S-Baffle (R04)
     * Recreates the S-curve stepped vertical acoustic blade from images/roster_4.jpg
     */
    function createAuthenticMinimalisStripGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const hw = width / 2;
        const hh = height / 2;

        const rim = 0.024;
        const cavX1 = -hw + rim;
        const cavX2 = hw - rim;
        const cavY1 = -hh + rim;
        const cavY2 = hh - rim;

        const parts = [];

        // 1. Outer bevelled frame with hollow square cavity
        const frameShape = new THREE.Shape();
        frameShape.moveTo(-hw, -hh);
        frameShape.lineTo(hw, -hh);
        frameShape.lineTo(hw, hh);
        frameShape.lineTo(-hw, hh);
        frameShape.closePath();

        const cavityHole = new THREE.Path();
        const cr = 0.003;
        cavityHole.moveTo(cavX1 + cr, cavY1);
        cavityHole.lineTo(cavX2 - cr, cavY1);
        cavityHole.quadraticCurveTo(cavX2, cavY1, cavX2, cavY1 + cr);
        cavityHole.lineTo(cavX2, cavY2 - cr);
        cavityHole.quadraticCurveTo(cavX2, cavY2, cavX2 - cr, cavY2);
        cavityHole.lineTo(cavX1 + cr, cavY2);
        cavityHole.quadraticCurveTo(cavX1, cavY2, cavX1, cavY2 - cr);
        cavityHole.lineTo(cavX1, cavY1 + cr);
        cavityHole.quadraticCurveTo(cavX1, cavY1, cavX1 + cr, cavY1);
        cavityHole.closePath();
        frameShape.holes.push(cavityHole);

        const frameGeom = new THREE.ExtrudeGeometry(frameShape, {
            depth: depth,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.0025,
            bevelThickness: 0.0025
        });
        frameGeom.center();
        parts.push(frameGeom);

        // 2. The S-Curve Stepped Louver Blade
        const sBladeShape = new THREE.Shape();
        const th = 0.014; // 14mm blade thickness
        const jog = 0.032; // 32mm horizontal offset

        sBladeShape.moveTo(-th / 2, cavY2 + 0.002);
        sBladeShape.lineTo(th / 2, cavY2 + 0.002);
        sBladeShape.lineTo(th / 2, 0.024);
        sBladeShape.lineTo(jog + (th / 2), -0.024);
        sBladeShape.lineTo(jog + (th / 2), cavY1 - 0.002);
        sBladeShape.lineTo(jog - (th / 2), cavY1 - 0.002);
        sBladeShape.lineTo(jog - (th / 2), -0.024);
        sBladeShape.lineTo(-th / 2, 0.024);
        sBladeShape.closePath();

        const bladeGeom = new THREE.ExtrudeGeometry(sBladeShape, {
            depth: depth - 0.004,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.002,
            bevelThickness: 0.002
        });
        bladeGeom.center();
        parts.push(bladeGeom);

        const unified = mergeBufferGeometries(parts);
        parts.forEach(p => p.dispose());
        return unified;
    }

    /**
     * Authentic 1:1 3D Geometry for Roster Sekat Tiga (R28)
     * Recreates the horizontal acoustic weather louver bar with dual horizontal air slits from images/roster_28.png
     */
    function createAuthenticSekatTigaGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const hw = width / 2;
        const hh = height / 2;

        const rimX = 0.024;
        const rimY = 0.024;
        const cavX1 = -hw + rimX;
        const cavX2 = hw - rimX;
        const cavY1 = -hh + rimY;
        const cavY2 = hh - rimY;
        const cavW = cavX2 - cavX1;

        const parts = [];

        // 1. Outer bevelled frame with hollow cavity
        const frameShape = new THREE.Shape();
        frameShape.moveTo(-hw, -hh);
        frameShape.lineTo(hw, -hh);
        frameShape.lineTo(hw, hh);
        frameShape.lineTo(-hw, hh);
        frameShape.closePath();

        const cavityHole = new THREE.Path();
        const cr = 0.003;
        cavityHole.moveTo(cavX1 + cr, cavY1);
        cavityHole.lineTo(cavX2 - cr, cavY1);
        cavityHole.quadraticCurveTo(cavX2, cavY1, cavX2, cavY1 + cr);
        cavityHole.lineTo(cavX2, cavY2 - cr);
        cavityHole.quadraticCurveTo(cavX2, cavY2, cavX2 - cr, cavY2);
        cavityHole.lineTo(cavX1 + cr, cavY2);
        cavityHole.quadraticCurveTo(cavX1, cavY2, cavX1, cavY2 - cr);
        cavityHole.lineTo(cavX1, cavY1 + cr);
        cavityHole.quadraticCurveTo(cavX1, cavY1, cavX1 + cr, cavY1);
        cavityHole.closePath();
        frameShape.holes.push(cavityHole);

        const frameGeom = new THREE.ExtrudeGeometry(frameShape, {
            depth: depth,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.0025,
            bevelThickness: 0.0025
        });
        frameGeom.center();
        parts.push(frameGeom);

        // 2. Central Chamfered Horizontal Louver Blade
        const bladeBarShape = new THREE.Shape();
        const bzFront = (depth / 2) - 0.003;
        const bzBack = -(depth / 2) + 0.003;
        const byTop = 0.034;
        const byBot = -0.034;

        bladeBarShape.moveTo(bzFront, byTop - 0.012);
        bladeBarShape.lineTo(bzFront, byBot + 0.012);
        bladeBarShape.lineTo(bzBack, byBot);
        bladeBarShape.lineTo(bzBack, byTop);
        bladeBarShape.closePath();

        const barGeom = new THREE.ExtrudeGeometry(bladeBarShape, {
            depth: cavW + 0.002,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.002,
            bevelThickness: 0.002
        });
        barGeom.center();
        barGeom.rotateY(Math.PI / 2);
        parts.push(barGeom);

        const unified = mergeBufferGeometries(parts);
        parts.forEach(p => p.dispose());
        return unified;
    }

    /**
     * Authentic 1:1 3D Geometry for Roster Sekat Miring (R23)
     * Recreates the prominent diagonal acoustic louver baffle blade from images/roster_23.jpg
     */
    function createAuthenticSekatMiringGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const hw = width / 2;
        const hh = height / 2;

        const rim = 0.024;
        const cavX1 = -hw + rim;
        const cavX2 = hw - rim;
        const cavY1 = -hh + rim;
        const cavY2 = hh - rim;
        const cavH = cavY2 - cavY1;

        const parts = [];

        // 1. Outer bevelled frame with hollow cavity
        const frameShape = new THREE.Shape();
        frameShape.moveTo(-hw, -hh);
        frameShape.lineTo(hw, -hh);
        frameShape.lineTo(hw, hh);
        frameShape.lineTo(-hw, hh);
        frameShape.closePath();

        const cavityHole = new THREE.Path();
        const cr = 0.003;
        cavityHole.moveTo(cavX1 + cr, cavY1);
        cavityHole.lineTo(cavX2 - cr, cavY1);
        cavityHole.quadraticCurveTo(cavX2, cavY1, cavX2, cavY1 + cr);
        cavityHole.lineTo(cavX2, cavY2 - cr);
        cavityHole.quadraticCurveTo(cavX2, cavY2, cavX2 - cr, cavY2);
        cavityHole.lineTo(cavX1 + cr, cavY2);
        cavityHole.quadraticCurveTo(cavX1, cavY2, cavX1, cavY2 - cr);
        cavityHole.lineTo(cavX1, cavY1 + cr);
        cavityHole.quadraticCurveTo(cavX1, cavY1, cavX1 + cr, cavY1);
        cavityHole.closePath();
        frameShape.holes.push(cavityHole);

        const frameGeom = new THREE.ExtrudeGeometry(frameShape, {
            depth: depth,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.0025,
            bevelThickness: 0.0025
        });
        frameGeom.center();
        parts.push(frameGeom);

        // 2. Slanted Acoustic Louver Baffle Blade in X-Z plane
        const bladeShape = new THREE.Shape();
        const bzFront = (depth / 2) - 0.004;
        const bzBack = -(depth / 2) + 0.004;
        const th = 0.016; // 16mm thick blade

        bladeShape.moveTo(-0.034, bzFront);
        bladeShape.lineTo(-0.034 + th, bzFront);
        bladeShape.lineTo(0.034 + th, bzBack);
        bladeShape.lineTo(0.034, bzBack);
        bladeShape.closePath();

        const bladeGeom = new THREE.ExtrudeGeometry(bladeShape, {
            depth: cavH + 0.002,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.0015,
            bevelThickness: 0.0015
        });
        bladeGeom.center();
        bladeGeom.rotateX(Math.PI / 2);
        parts.push(bladeGeom);

        const unified = mergeBufferGeometries(parts);
        parts.forEach(p => p.dispose());
        return unified;
    }

    /**
     * Registry of products with Authentic 1:1 Physical 3D Void Geometries
     */

    /**
     * R09: Roster Segitiga Terbalik (20x20x10 cm)
     */
    function createAuthenticSegitigaTerbalikGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const rim = 0.024;
        const xMin = -hw + rim, xMax = hw - rim;
        const yMin = -hh + rim, yMax = hh - rim;
        const midY = (yMin + yMax) / 2;

        const hTop = new THREE.Path();
        hTop.moveTo(xMin, yMax);
        hTop.lineTo(xMax, yMax);
        hTop.lineTo((xMin + xMax) / 2, midY + 0.008);
        hTop.closePath();
        shape.holes.push(hTop);

        const hBotL = new THREE.Path();
        hBotL.moveTo(xMin, yMin);
        hBotL.lineTo((xMin + xMax) / 2 - 0.008, yMin);
        hBotL.lineTo(xMin, midY - 0.008);
        hBotL.closePath();
        shape.holes.push(hBotL);

        const hBotR = new THREE.Path();
        hBotR.moveTo(xMax, yMin);
        hBotR.lineTo(xMax, midY - 0.008);
        hBotR.lineTo((xMin + xMax) / 2 + 0.008, yMin);
        hBotR.closePath();
        shape.holes.push(hBotR);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R19: Roster Segitiga Lancip (20x20x10 cm)
     */
    function createAuthenticSegitigaLancipGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const rim = 0.026;
        const h = new THREE.Path();
        h.moveTo(0, hh - rim);
        h.lineTo(hw - rim, -hh + rim);
        h.lineTo(-hw + rim, -hh + rim);
        h.closePath();
        shape.holes.push(h);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R14: Roster Segitiga Prisma 3D (20x20x10 cm)
     */
    function createAuthenticPrismaSegitigaGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const rim = 0.024;
        const barHalf = 0.014;
        const h1 = new THREE.Path();
        h1.moveTo(-hw + rim, -hh + rim);
        h1.lineTo(hw - rim - (barHalf * 2), -hh + rim);
        h1.lineTo(-hw + rim, hh - rim - (barHalf * 2));
        h1.closePath();
        shape.holes.push(h1);

        const h2 = new THREE.Path();
        h2.moveTo(hw - rim, hh - rim);
        h2.lineTo(-hw + rim + (barHalf * 2), hh - rim);
        h2.lineTo(hw - rim, -hh + rim + (barHalf * 2));
        h2.closePath();
        shape.holes.push(h2);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R24: Roster Geometris Sudut (20x20x10 cm)
     */
    function createAuthenticGeometrisSudutGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const rim = 0.022;
        const h1 = new THREE.Path();
        h1.moveTo(-hw + rim, 0.010);
        h1.lineTo(-0.010, 0.010);
        h1.lineTo(-0.010, hh - rim);
        h1.lineTo(-hw + rim, hh - rim);
        h1.closePath();
        shape.holes.push(h1);

        const h2 = new THREE.Path();
        h2.moveTo(0.010, 0.010);
        h2.lineTo(hw - rim, 0.010);
        h2.lineTo(hw - rim, hh - rim);
        h2.lineTo(0.010, hh - rim);
        h2.closePath();
        shape.holes.push(h2);

        const h3 = new THREE.Path();
        h3.moveTo(-hw + rim, -hh + rim);
        h3.lineTo(hw - rim, -hh + rim);
        h3.lineTo(hw - rim, -0.010);
        h3.lineTo(-hw + rim, -0.010);
        h3.closePath();
        shape.holes.push(h3);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R29: Roster Z Terbalik (20x20x10 cm)
     */
    function createAuthenticZTerbalikGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const rim = 0.024;
        const hTop = new THREE.Path();
        hTop.moveTo(-hw + rim, -0.020);
        hTop.lineTo(hw - rim, hh - rim);
        hTop.lineTo(-hw + rim, hh - rim);
        hTop.closePath();
        shape.holes.push(hTop);

        const hBot = new THREE.Path();
        hBot.moveTo(hw - rim, 0.020);
        hBot.lineTo(-hw + rim, -hh + rim);
        hBot.lineTo(hw - rim, -hh + rim);
        hBot.closePath();
        shape.holes.push(hBot);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R30: Roster Bunga Empat Kelopak (20x20x10 cm)
     */
    function createAuthenticBunga4KelopakGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const offset = 0.042;
        const r = 0.028;
        [[offset, offset], [-offset, offset], [-offset, -offset], [offset, -offset]].forEach(([cx, cy]) => {
            const h = new THREE.Path();
            h.absarc(cx, cy, r, 0, Math.PI * 2, true);
            shape.holes.push(h);
        });

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R22: Roster Diagonal Asimetris (20x20x10 cm)
     */
    function createAuthenticDiagonalAsimetrisGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const rim = 0.024;
        const h1 = new THREE.Path();
        h1.moveTo(-hw + rim, -hh + rim);
        h1.lineTo(0.010, -hh + rim);
        h1.lineTo(hw - rim, hh - rim);
        h1.lineTo(-hw + rim, hh - rim);
        h1.closePath();
        shape.holes.push(h1);

        const h2 = new THREE.Path();
        h2.moveTo(0.035, -hh + rim);
        h2.lineTo(hw - rim, -hh + rim);
        h2.lineTo(hw - rim, 0.020);
        h2.closePath();
        shape.holes.push(h2);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R06: Roster Bintang Segi Empat (20x20x10 cm)
     */
    function createAuthenticBintang4Geometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const outerR = 0.068;
        const innerR = 0.024;
        const starHole = new THREE.Path();
        starHole.moveTo(0, outerR);
        starHole.lineTo(innerR, innerR);
        starHole.lineTo(outerR, 0);
        starHole.lineTo(innerR, -innerR);
        starHole.lineTo(0, -outerR);
        starHole.lineTo(-innerR, -innerR);
        starHole.lineTo(-outerR, 0);
        starHole.lineTo(-innerR, innerR);
        starHole.closePath();
        shape.holes.push(starHole);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R08: Roster Lengkung Vertikal (20x20x10 cm)
     */
    function createAuthenticLengkungVertikalGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const rim = 0.026;
        const archW = (hw - rim);
        const archH = (hh - rim);
        const archHole = new THREE.Path();
        archHole.moveTo(-archW, -archH);
        archHole.lineTo(archW, -archH);
        archHole.lineTo(archW, 0.020);
        archHole.absarc(0, 0.020, archW, 0, Math.PI, false);
        archHole.lineTo(-archW, -archH);
        archHole.closePath();
        shape.holes.push(archHole);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R10: Roster Cekung Horizontal (20x20x10 cm)
     */
    function createAuthenticCekungHorizontalGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const hw = width / 2;
        const hh = height / 2;
        const rim = 0.024;
        const cavX1 = -hw + rim;
        const cavX2 = hw - rim;
        const cavY1 = -hh + rim;
        const cavY2 = hh - rim;
        const cavW = cavX2 - cavX1;

        const parts = [];

        const frameShape = new THREE.Shape();
        frameShape.moveTo(-hw, -hh); frameShape.lineTo(hw, -hh); frameShape.lineTo(hw, hh); frameShape.lineTo(-hw, hh); frameShape.closePath();
        const cavity = new THREE.Path();
        cavity.moveTo(cavX1, cavY1); cavity.lineTo(cavX2, cavY1); cavity.lineTo(cavX2, cavY2); cavity.lineTo(cavX1, cavY2); cavity.closePath();
        frameShape.holes.push(cavity);

        const frameGeom = new THREE.ExtrudeGeometry(frameShape, {
            depth: depth,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.0025,
            bevelThickness: 0.0025
        });
        frameGeom.center();
        parts.push(frameGeom);

        const cylRadius = 0.090;
        const cylGeom = new THREE.CylinderGeometry(cylRadius, cylRadius, cavW, 24, 1, false, 0, Math.PI * 0.7);
        cylGeom.rotateZ(Math.PI / 2);
        cylGeom.rotateY(Math.PI / 2);
        cylGeom.translate(0, 0, 0.010);
        parts.push(cylGeom);

        const unified = mergeBufferGeometries(parts);
        parts.forEach(p => p.dispose());
        return unified;
    }

    /**
     * R17: Roster Bulan Sabit (20x20x10 cm)
     */
    function createAuthenticBulanSabitGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const moonHole = new THREE.Path();
        const rOuter = 0.065;
        const rInner = 0.055;
        moonHole.absarc(0, 0, rOuter, -Math.PI * 0.4, Math.PI * 0.4, false);
        moonHole.absarc(-0.025, 0, rInner, Math.PI * 0.4, -Math.PI * 0.4, true);
        moonHole.closePath();
        shape.holes.push(moonHole);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R32: Roster Bintang Putar (20x20x10 cm)
     */
    function createAuthenticBintangPutarGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const rMax = 0.065;
        const rMin = 0.015;
        for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const h = new THREE.Path();
            h.moveTo(Math.cos(angle) * rMin, Math.sin(angle) * rMin);
            h.lineTo(Math.cos(angle) * rMax, Math.sin(angle) * rMax);
            h.lineTo(Math.cos(angle + 0.5) * (rMax * 0.75), Math.sin(angle + 0.5) * (rMax * 0.75));
            h.closePath();
            shape.holes.push(h);
        }

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R15: Roster Bintang Kompleks / Mashrabiya (20x20x10 cm)
     */
    function createAuthenticBintangKompleksGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const rOuter = 0.048;
        const rInner = 0.024;
        const starHole = new THREE.Path();
        for (let i = 0; i < 16; i++) {
            const r = (i % 2 === 0) ? rOuter : rInner;
            const a = (i * Math.PI) / 8;
            const x = Math.cos(a) * r;
            const y = Math.sin(a) * r;
            if (i === 0) starHole.moveTo(x, y);
            else starHole.lineTo(x, y);
        }
        starHole.closePath();
        shape.holes.push(starHole);

        const cOffset = 0.058;
        const cSize = 0.016;
        [[cOffset, cOffset], [-cOffset, cOffset], [-cOffset, -cOffset], [cOffset, -cOffset]].forEach(([cx, cy]) => {
            const ch = new THREE.Path();
            ch.moveTo(cx - cSize, cy - cSize);
            ch.lineTo(cx + cSize, cy - cSize);
            ch.lineTo(cx + cSize, cy + cSize);
            ch.lineTo(cx - cSize, cy + cSize);
            ch.closePath();
            shape.holes.push(ch);
        });

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R18 & R31: Roster Motif Labirin & Labirin Klasik (20x20x10 cm)
     */
    function createAuthenticLabirinGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const slotW = 0.018;
        const h1 = new THREE.Path();
        h1.moveTo(-0.065, 0.065);
        h1.lineTo(0.065, 0.065);
        h1.lineTo(0.065, 0.010);
        h1.lineTo(0.065 - slotW, 0.010);
        h1.lineTo(0.065 - slotW, 0.065 - slotW);
        h1.lineTo(-0.065, 0.065 - slotW);
        h1.closePath();
        shape.holes.push(h1);

        const h2 = new THREE.Path();
        h2.moveTo(0.065, -0.065);
        h2.lineTo(-0.065, -0.065);
        h2.lineTo(-0.065, -0.010);
        h2.lineTo(-0.065 + slotW, -0.010);
        h2.lineTo(-0.065 + slotW, -0.065 + slotW);
        h2.lineTo(0.065, -0.065 + slotW);
        h2.closePath();
        shape.holes.push(h2);

        const h3 = new THREE.Path();
        h3.moveTo(-0.025, -0.025);
        h3.lineTo(0.025, -0.025);
        h3.lineTo(0.025, 0.025);
        h3.lineTo(-0.025, 0.025);
        h3.closePath();
        shape.holes.push(h3);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R26: Roster Kotak Berlapis (20x20x10 cm)
     */
    function createAuthenticKotakBerlapisGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const s = 0.024;
        const d = 0.045;
        [[d, d], [-d, d], [-d, -d], [d, -d]].forEach(([cx, cy]) => {
            const h = new THREE.Path();
            h.moveTo(cx - s, cy - s);
            h.lineTo(cx + s, cy - s);
            h.lineTo(cx + s, cy + s);
            h.lineTo(cx - s, cy + s);
            h.closePath();
            shape.holes.push(h);
        });

        const cs = 0.020;
        const ch = new THREE.Path();
        ch.moveTo(-cs, -cs); ch.lineTo(cs, -cs); ch.lineTo(cs, cs); ch.lineTo(-cs, cs); ch.closePath();
        shape.holes.push(ch);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R33: Roster Balok Asimetris Komposisi (20x20x10 cm)
     */
    function createAuthenticBalokAsimetrisGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const rim = 0.022;
        const h1 = new THREE.Path();
        h1.moveTo(-hw + rim, 0.015);
        h1.lineTo(hw - rim, 0.015);
        h1.lineTo(hw - rim, hh - rim);
        h1.lineTo(-hw + rim, hh - rim);
        h1.closePath();
        shape.holes.push(h1);

        const h2 = new THREE.Path();
        h2.moveTo(-hw + rim, -hh + rim);
        h2.lineTo(-0.015, -hh + rim);
        h2.lineTo(-0.015, -0.015);
        h2.lineTo(-hw + rim, -0.015);
        h2.closePath();
        shape.holes.push(h2);

        const h3 = new THREE.Path();
        h3.moveTo(0.015, -hh + rim);
        h3.lineTo(hw - rim, -hh + rim);
        h3.lineTo(hw - rim, -0.015);
        h3.lineTo(0.015, -0.015);
        h3.closePath();
        shape.holes.push(h3);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R36: Roster Beton Geometris Konsentris (Flagship) (20x20x10 cm)
     */
    function createAuthenticKonsentrisGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.005;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const outerCircle = new THREE.Path();
        outerCircle.absarc(0, 0, 0.065, 0, Math.PI * 2, true);
        shape.holes.push(outerCircle);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 3,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R16 & R21: Roster Piramida Abu-abu / Piramida Persegi (20x20x10 cm)
     */
    function createAuthenticPiramidaGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const r = 0.045;
        const h = new THREE.Path();
        h.moveTo(0, r); h.lineTo(r, 0); h.lineTo(0, -r); h.lineTo(-r, 0); h.closePath();
        shape.holes.push(h);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.008,
            bevelThickness: 0.012
        });
        geom.center();
        return geom;
    }

    /**
     * R25: Roster Prisma Tengah (20x20x10 cm)
     */
    function createAuthenticPrismaTengahGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const rim = 0.024;
        const d = 0.050;
        const h1 = new THREE.Path();
        h1.moveTo(-hw + rim, hh - rim); h1.lineTo(-d, hh - rim); h1.lineTo(-hw + rim, d); h1.closePath();
        shape.holes.push(h1);

        const h2 = new THREE.Path();
        h2.moveTo(hw - rim, hh - rim); h2.lineTo(hw - rim, d); h2.lineTo(d, hh - rim); h2.closePath();
        shape.holes.push(h2);

        const h3 = new THREE.Path();
        h3.moveTo(hw - rim, -hh + rim); h3.lineTo(d, -hh + rim); h3.lineTo(hw - rim, -d); h3.closePath();
        shape.holes.push(h3);

        const h4 = new THREE.Path();
        h4.moveTo(-hw + rim, -hh + rim); h4.lineTo(-hw + rim, -d); h4.lineTo(-d, -hh + rim); h4.closePath();
        shape.holes.push(h4);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R20: Roster Kubik Bulat (20x20x10 cm)
     */
    function createAuthenticKubikBulatGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.010;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const hole = new THREE.Path();
        hole.absarc(0, 0, 0.055, 0, Math.PI * 2, true);
        shape.holes.push(hole);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 4,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R03: Roster Motif Daun (20x20x10 cm)
     */
    function createAuthenticMotifDaunGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const hLeft = new THREE.Path();
        hLeft.moveTo(-0.020, 0.065);
        hLeft.quadraticCurveTo(-0.065, 0.035, -0.065, -0.055);
        hLeft.lineTo(-0.020, -0.055);
        hLeft.quadraticCurveTo(-0.035, 0.000, -0.020, 0.065);
        hLeft.closePath();
        shape.holes.push(hLeft);

        const hRight = new THREE.Path();
        hRight.moveTo(0.020, 0.065);
        hRight.quadraticCurveTo(0.065, 0.035, 0.065, -0.055);
        hRight.lineTo(0.020, -0.055);
        hRight.quadraticCurveTo(0.035, 0.000, 0.020, 0.065);
        hRight.closePath();
        shape.holes.push(hRight);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R12: Roster Motif Bunga Bulat (20x20x10 cm)
     */
    function createAuthenticBungaBulatGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const offset = 0.040;
        const rPetal = 0.024;
        [[0, offset], [offset, 0], [0, -offset], [-offset, 0]].forEach(([cx, cy]) => {
            const h = new THREE.Path();
            h.absarc(cx, cy, rPetal, 0, Math.PI * 2, true);
            shape.holes.push(h);
        });

        const ch = new THREE.Path();
        ch.absarc(0, 0, 0.012, 0, Math.PI * 2, true);
        shape.holes.push(ch);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R13: Roster Motif Daun Tetesan Air (20x20x10 cm)
     */
    function createAuthenticTetesAirGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const h1 = new THREE.Path();
        h1.moveTo(-0.035, 0.055);
        h1.quadraticCurveTo(-0.065, 0.010, -0.035, -0.040);
        h1.quadraticCurveTo(-0.005, 0.010, -0.035, 0.055);
        h1.closePath();
        shape.holes.push(h1);

        const h2 = new THREE.Path();
        h2.moveTo(0.035, -0.055);
        h2.quadraticCurveTo(0.065, -0.010, 0.035, 0.040);
        h2.quadraticCurveTo(0.005, -0.010, 0.035, -0.055);
        h2.closePath();
        shape.holes.push(h2);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * R37: Roster Terakota Mandala Flora (Flagship) (20x20x10 cm)
     */
    function createAuthenticMandalaFloraGeometry(width = 0.20, height = 0.20, depth = 0.10) {
        const bevel = 0.0025;
        const hw = (width / 2) - bevel;
        const hh = (height / 2) - bevel;
        const shape = new THREE.Shape();
        shape.moveTo(-hw, -hh); shape.lineTo(hw, -hh); shape.lineTo(hw, hh); shape.lineTo(-hw, hh); shape.closePath();

        const rPetal = 0.046;
        for (let i = 0; i < 8; i++) {
            const a = (i * Math.PI) / 4;
            const cx = Math.cos(a) * rPetal;
            const cy = Math.sin(a) * rPetal;
            const h = new THREE.Path();
            h.absarc(cx, cy, 0.014, 0, Math.PI * 2, true);
            shape.holes.push(h);
        }

        const centerHole = new THREE.Path();
        centerHole.absarc(0, 0, 0.020, 0, Math.PI * 2, true);
        shape.holes.push(centerHole);

        const geom = new THREE.ExtrudeGeometry(shape, {
            depth: depth - (bevel * 2),
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: bevel,
            bevelThickness: bevel
        });
        geom.center();
        return geom;
    }

    /**
     * Registry of products with Authentic 1:1 Physical 3D Void Geometries (All 35 Catalog Products)
     */
    const PRECISION_3D_REGISTRY = {
        'R01': { geomKey: 'hemavara', width: 0.10, height: 0.20, depth: 0.10, defaultMat: 'terracotta' },
        'R02': { geomKey: 'kampak', width: 0.10, height: 0.30, depth: 0.10, defaultMat: 'concrete' },
        'R03': { geomKey: 'motif_daun', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R04': { geomKey: 'minimalis_strip', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'terracotta' },
        'R05': { geomKey: 'lingkaran_retro', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'white' },
        'R06': { geomKey: 'bintang_4', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R07': { geomKey: 'silang_diagonal', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'terracotta' },
        'R08': { geomKey: 'lengkung_vertikal', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R09': { geomKey: 'segitiga_terbalik', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R10': { geomKey: 'cekung_horizontal', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'white' },
        'R11': { geomKey: 'kotak_4', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R12': { geomKey: 'bunga_bulat', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R13': { geomKey: 'tetes_air', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R14': { geomKey: 'prisma_segitiga', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R15': { geomKey: 'bintang_kompleks', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'white' },
        'R16': { geomKey: 'piramida', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R17': { geomKey: 'bulan_sabit', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R18': { geomKey: 'labirin', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R19': { geomKey: 'segitiga_lancip', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'terracotta' },
        'R20': { geomKey: 'kubik_bulat', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R21': { geomKey: 'piramida', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R22': { geomKey: 'diagonal_asimetris', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R23': { geomKey: 'sekat_miring', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'white' },
        'R24': { geomKey: 'geometris_sudut', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R25': { geomKey: 'prisma_tengah', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R26': { geomKey: 'kotak_berlapis', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R27': { geomKey: 'kotak_polos', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R28': { geomKey: 'sekat_tiga', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'white' },
        'R29': { geomKey: 'z_terbalik', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'white' },
        'R30': { geomKey: 'bunga_4_kelopak', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'white' },
        'R31': { geomKey: 'labirin', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R32': { geomKey: 'bintang_putar', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'white' },
        'R33': { geomKey: 'balok_asimetris', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R36': { geomKey: 'konsentris', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'concrete' },
        'R37': { geomKey: 'mandala_flora', width: 0.20, height: 0.20, depth: 0.10, defaultMat: 'terracotta' }
    };

    /**
     * 7. Procedural 3D Void Geometries (Mode Procedural)
     */
    function getBlockGeometry(motifType, customW, customH, customD) {
        const width = customW || STATE.blockWidth || STATE.blockSize;
        const height = customH || STATE.blockHeight || STATE.blockSize;
        const depth = customD || STATE.blockDepth || 0.10;
        const cacheKey = `${motifType}_${width.toFixed(3)}_${height.toFixed(3)}_${depth.toFixed(3)}`;

        if (geometriesMap[cacheKey]) {
            return geometriesMap[cacheKey];
        }

        switch (motifType) {
             case 'hemavara':
            case 'R01': {
                const geom = createAuthenticHemavaraGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'kampak':
            case 'R02': {
                const geom = createAuthenticKampakGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'motif_daun':
            case 'R03': {
                const geom = createAuthenticMotifDaunGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'minimalis_strip':
            case 'R04': {
                const geom = createAuthenticMinimalisStripGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'lingkaran_retro':
            case 'R05': {
                const geom = createAuthenticLingkaranRetroGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'bintang_4':
            case 'R06': {
                const geom = createAuthenticBintang4Geometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'silang_diagonal':
            case 'R07': {
                const geom = createAuthenticSilangGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'lengkung_vertikal':
            case 'R08': {
                const geom = createAuthenticLengkungVertikalGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'segitiga_terbalik':
            case 'R09': {
                const geom = createAuthenticSegitigaTerbalikGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'cekung_horizontal':
            case 'R10': {
                const geom = createAuthenticCekungHorizontalGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'kotak_4':
            case 'R11': {
                const geom = createAuthenticKotak4Geometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'bunga_bulat':
            case 'R12': {
                const geom = createAuthenticBungaBulatGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'tetes_air':
            case 'R13': {
                const geom = createAuthenticTetesAirGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'prisma_segitiga':
            case 'R14': {
                const geom = createAuthenticPrismaSegitigaGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'bintang_kompleks':
            case 'R15': {
                const geom = createAuthenticBintangKompleksGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'piramida':
            case 'R16':
            case 'R21': {
                const geom = createAuthenticPiramidaGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'bulan_sabit':
            case 'R17': {
                const geom = createAuthenticBulanSabitGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'labirin':
            case 'R18':
            case 'R31': {
                const geom = createAuthenticLabirinGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'segitiga_lancip':
            case 'R19': {
                const geom = createAuthenticSegitigaLancipGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'kubik_bulat':
            case 'R20': {
                const geom = createAuthenticKubikBulatGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'diagonal_asimetris':
            case 'R22': {
                const geom = createAuthenticDiagonalAsimetrisGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'sekat_miring':
            case 'R23': {
                const geom = createAuthenticSekatMiringGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'geometris_sudut':
            case 'R24': {
                const geom = createAuthenticGeometrisSudutGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'prisma_tengah':
            case 'R25': {
                const geom = createAuthenticPrismaTengahGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'kotak_berlapis':
            case 'R26': {
                const geom = createAuthenticKotakBerlapisGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'kotak_polos':
            case 'R27': {
                const geom = createAuthenticKotakPolosGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'sekat_tiga':
            case 'R28': {
                const geom = createAuthenticSekatTigaGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'z_terbalik':
            case 'R29': {
                const geom = createAuthenticZTerbalikGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'bunga_4_kelopak':
            case 'R30': {
                const geom = createAuthenticBunga4KelopakGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'bintang_putar':
            case 'R32': {
                const geom = createAuthenticBintangPutarGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'balok_asimetris':
            case 'R33': {
                const geom = createAuthenticBalokAsimetrisGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'konsentris':
            case 'R36': {
                const geom = createAuthenticKonsentrisGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'mandala_flora':
            case 'R37': {
                const geom = createAuthenticMandalaFloraGeometry(width, height, depth);
                geometriesMap[cacheKey] = geom;
                return geom;
            }
            case 'square': {
                const halfW = width / 2;
                const halfH = height / 2;
                const shape = new THREE.Shape();
                shape.moveTo(-halfW, -halfH);
                shape.lineTo(halfW, -halfH);
                shape.lineTo(halfW, halfH);
                shape.lineTo(-halfW, halfH);
                shape.closePath();
                const v = 0.065;
                const hole = new THREE.Path();
                hole.moveTo(-v, -v);
                hole.lineTo(v, -v);
                hole.lineTo(v, v);
                hole.lineTo(-v, v);
                hole.closePath();
                shape.holes.push(hole);
                break;
            }
            case 'circle': {
                const hole = new THREE.Path();
                hole.absarc(0, 0, 0.068, 0, Math.PI * 2, true);
                shape.holes.push(hole);
                break;
            }
            case 'cross': {
                const d = 0.07;
                const gap = 0.016;
                const hTop = new THREE.Path();
                hTop.moveTo(0, gap);
                hTop.lineTo(d, d);
                hTop.lineTo(-d, d);
                hTop.closePath();
                shape.holes.push(hTop);

                const hBottom = new THREE.Path();
                hBottom.moveTo(0, -gap);
                hBottom.lineTo(d, -d);
                hBottom.lineTo(-d, -d);
                hBottom.closePath();
                shape.holes.push(hBottom);

                const hLeft = new THREE.Path();
                hLeft.moveTo(-gap, 0);
                hLeft.lineTo(-d, d);
                hLeft.lineTo(-d, -d);
                hLeft.closePath();
                shape.holes.push(hLeft);

                const hRight = new THREE.Path();
                hRight.moveTo(gap, 0);
                hRight.lineTo(d, d);
                hRight.lineTo(d, -d);
                hRight.closePath();
                shape.holes.push(hRight);
                break;
            }
            case 'clover': {
                const offset = 0.038;
                const r = 0.026;
                [[offset, offset], [-offset, offset], [-offset, -offset], [offset, -offset]].forEach(([cx, cy]) => {
                    const h = new THREE.Path();
                    h.absarc(cx, cy, r, 0, Math.PI * 2, true);
                    shape.holes.push(h);
                });
                break;
            }
            case 'slits': {
                const slitW = 0.14;
                const slitH = 0.022;
                [0.046, 0, -0.046].forEach((yPos) => {
                    const h = new THREE.Path();
                    h.moveTo(-slitW / 2, yPos - slitH / 2);
                    h.lineTo(slitW / 2, yPos - slitH / 2);
                    h.lineTo(slitW / 2, yPos + slitH / 2);
                    h.lineTo(-slitW / 2, yPos + slitH / 2);
                    h.closePath();
                    shape.holes.push(h);
                });
                break;
            }
            case 'dualslits': {
                const sW = 0.03;
                const sH = 0.14;
                [-0.04, 0.04].forEach((xPos) => {
                    const h = new THREE.Path();
                    h.moveTo(xPos - sW / 2, -sH / 2);
                    h.lineTo(xPos + sW / 2, -sH / 2);
                    h.lineTo(xPos + sW / 2, sH / 2);
                    h.lineTo(xPos - sW / 2, sH / 2);
                    h.closePath();
                    shape.holes.push(h);
                });
                break;
            }
            case 'triangle': {
                const tHole1 = new THREE.Path();
                tHole1.moveTo(-0.065, 0.065);
                tHole1.lineTo(0.05, 0.065);
                tHole1.lineTo(-0.065, -0.05);
                tHole1.closePath();
                shape.holes.push(tHole1);

                const tHole2 = new THREE.Path();
                tHole2.moveTo(0.065, -0.065);
                tHole2.lineTo(-0.05, -0.065);
                tHole2.lineTo(0.065, 0.05);
                tHole2.closePath();
                shape.holes.push(tHole2);
                break;
            }
            case 'diamond': {
                const rad = 0.068;
                const dHole = new THREE.Path();
                dHole.moveTo(0, rad);
                dHole.lineTo(rad, 0);
                dHole.lineTo(0, -rad);
                dHole.lineTo(-rad, 0);
                dHole.closePath();
                shape.holes.push(dHole);
                break;
            }
        }

        const extrudeSettings = {
            depth: depth,
            bevelEnabled: true,
            bevelSegments: 2,
            steps: 1,
            bevelSize: 0.003,
            bevelThickness: 0.003
        };

        const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geom.center();
        geometriesMap[cacheKey] = geom;
        return geom;
    }

    /**
     * 8. Build 3D Wall (Supports Real Catalog Products & Procedural)
     */
    function buildWall() {
        if (instancedWallMesh) {
            scene.remove(instancedWallMesh);
            if (instancedWallMesh.geometry) instancedWallMesh.geometry.dispose();
            instancedWallMesh = null;
        }

        const precisionConfig = (STATE.mode === 'catalog' && STATE.selectedProduct)
            ? PRECISION_3D_REGISTRY[STATE.selectedProduct.id]
            : null;

        const blockW = precisionConfig ? precisionConfig.width : (STATE.blockWidth || STATE.blockSize);
        const blockH = precisionConfig ? precisionConfig.height : (STATE.blockHeight || STATE.blockSize);
        const blockD = precisionConfig ? precisionConfig.depth : (STATE.blockDepth || 0.10);

        const pitchX = blockW + STATE.mortarGap;
        const pitchY = blockH + STATE.mortarGap;
        const cols = Math.max(2, Math.round(STATE.wallWidth / pitchX));
        const rows = Math.max(2, Math.round(STATE.wallHeight / pitchY));
        const totalCount = cols * rows;

        let geometry, material;

        if (precisionConfig) {
            // Authentic 1:1 Physical 3D Void Extrusion Model
            geometry = getBlockGeometry(precisionConfig.geomKey, blockW, blockH, blockD);
            material = materialsMap[STATE.currentMaterial] || materialsMap[precisionConfig.defaultMat] || materialsMap.concrete;
        } else if (STATE.mode === 'catalog' && STATE.selectedProduct) {
            // Real Catalog Product Mode: Texture mapped with authentic product photo
            geometry = new THREE.BoxGeometry(blockW, blockH, blockD);
            const tex = getProductTexture(STATE.selectedProduct.image);

            // Determine matching side edge material
            const sideMat = materialsMap[STATE.currentMaterial] || materialsMap.concrete;

            // Front and Back Face Material with exact product photo & tactile micro-bump
            const frontBackMat = new THREE.MeshStandardMaterial({
                map: tex,
                bumpMap: tex,
                bumpScale: 0.002,
                roughness: 0.82,
                metalness: 0.04
            });

            // 6-face box material: [right, left, top, bottom, front, back]
            material = [sideMat, sideMat, sideMat, sideMat, frontBackMat, frontBackMat];
        } else {
            // Procedural 3D Void Extrusion Mode
            geometry = getBlockGeometry(STATE.currentMotif, blockW, blockH, blockD);
            material = materialsMap[STATE.currentMaterial] || materialsMap.concrete;
        }

        instancedWallMesh = new THREE.InstancedMesh(geometry, material, totalCount);
        instancedWallMesh.castShadow = true;
        instancedWallMesh.receiveShadow = true;

        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const rotation = new THREE.Euler();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3(1, 1, 1);

        const totalWidth = cols * pitchX;
        const halfWidth = totalWidth / 2;
        let idx = 0;

        for (let r = 0; r < rows; r++) {
            const yPos = (r * pitchY) + (blockH / 2) + 0.08;
            const isOddRow = r % 2 === 1;
            const rowShift = (STATE.bondType === 'running' && isOddRow) ? (pitchX / 2) : 0;

            for (let c = 0; c < cols; c++) {
                const xPos = (c * pitchX) - halfWidth + (blockW / 2) + rowShift;
                const zPos = 0;

                position.set(xPos, yPos, zPos);
                quaternion.setFromEuler(rotation);
                matrix.compose(position, quaternion, scale);

                instancedWallMesh.setMatrixAt(idx, matrix);
                idx++;
            }
        }

        instancedWallMesh.instanceMatrix.needsUpdate = true;
        scene.add(instancedWallMesh);

        // Update Spec Calculations
        calculateSpecifications(cols, rows, blockW, blockH);
    }

    /**
     * 9. Render Catalog Product Picker UI (35 Products)
     */
    function renderCatalogProductPicker(filterCategory, searchQuery) {
        const container = document.getElementById('catalogProductsGrid');
        if (!container || !window.CATALOG_PRODUCTS) return;

        container.innerHTML = '';
        const query = (searchQuery || '').toLowerCase().trim();

        const filtered = window.CATALOG_PRODUCTS.filter(p => {
            const cat = (p.category || '').toLowerCase();
            const tags = (p.tags || []).map(t => t.toLowerCase());

            let matchesCat = true;
            if (filterCategory && filterCategory !== 'all') {
                if (filterCategory === 'flagship') {
                    matchesCat = Boolean(p.isFlagship);
                } else if (filterCategory === 'terakota') {
                    matchesCat = cat.includes('terakota') || tags.includes('terakota');
                } else if (filterCategory === 'geometris') {
                    matchesCat = cat.includes('geometris') || tags.includes('geometris');
                } else if (filterCategory === 'minimalis') {
                    matchesCat = cat.includes('minimalis') || tags.includes('minimalis') || tags.includes('garis');
                } else if (filterCategory === 'flora') {
                    matchesCat = cat.includes('flora') || tags.includes('flora') || tags.includes('daun');
                }
            }

            let matchesQ = true;
            if (query) {
                matchesQ = (p.name || '').toLowerCase().includes(query) ||
                    (p.id || '').toLowerCase().includes(query) ||
                    (p.material || '').toLowerCase().includes(query);
            }

            return matchesCat && matchesQ;
        });

        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="grid-column: span 2; text-align: center; padding: 24px 10px; color: #94A3B8; font-size: 0.85rem;">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 1.5rem; margin-bottom: 8px; display: block; opacity: 0.5;"></i>
                    Tidak ada motif yang cocok dengan pencarian "<strong>${searchQuery}</strong>".
                </div>
            `;
            return;
        }

        filtered.forEach(product => {
            const card = document.createElement('div');
            const isActive = STATE.selectedProduct && STATE.selectedProduct.id === product.id;
            card.className = `catalog-product-card-3d ${isActive ? 'active' : ''}`;
            card.setAttribute('data-id', product.id);

            const isPrecision3D = Boolean(PRECISION_3D_REGISTRY[product.id]);
            const badge3D = isPrecision3D ? 
                `<span style="display:inline-block; margin-top:3px; background:rgba(37, 211, 102, 0.18); color:#22C55E; font-size:0.65rem; padding:1px 6px; border-radius:3px; font-weight:700;"><i class="fa-solid fa-cube"></i> Model 3D Presisi</span>` : '';

            card.innerHTML = `
                <div class="catalog-thumb-wrap">
                    <img src="${product.image}" alt="${product.name}" class="catalog-thumb-img" loading="lazy">
                    <span class="catalog-thumb-badge">${product.id}</span>
                </div>
                <div class="catalog-card-title" title="${product.name}">${product.name} ${badge3D}</div>
                <div class="catalog-card-meta-row">
                    <span class="catalog-card-mat" title="${product.material}">${product.material}</span>
                    <span class="catalog-card-price">${product.priceFormatted.replace(' / pcs', '')}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                selectProduct(product);
                document.querySelectorAll('.catalog-product-card-3d').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });

            container.appendChild(card);
        });
    }

    /**
     * 10. Select Product Action
     */
    function selectProduct(product) {
        STATE.mode = 'catalog';
        STATE.selectedProduct = product;
        STATE.selectedProductId = product.id;

        const precisionConfig = PRECISION_3D_REGISTRY[product.id];

        if (precisionConfig) {
            STATE.blockWidth = precisionConfig.width;
            STATE.blockHeight = precisionConfig.height;
            STATE.blockDepth = precisionConfig.depth;
            STATE.currentMaterial = precisionConfig.defaultMat;
        } else {
            STATE.blockWidth = STATE.blockSize;
            STATE.blockHeight = STATE.blockSize;
            STATE.blockDepth = 0.10;

            // Auto-detect material finishing
            const mat = (product.material || '').toLowerCase();
            const cat = (product.category || '').toLowerCase();
            if (cat.includes('terakota') || mat.includes('terracotta') || mat.includes('terakota')) {
                STATE.currentMaterial = 'terracotta';
            } else if (mat.includes('putih')) {
                STATE.currentMaterial = 'white';
            } else if (mat.includes('charcoal') || mat.includes('hitam')) {
                STATE.currentMaterial = 'charcoal';
            } else {
                STATE.currentMaterial = 'concrete';
            }
        }

        // Update material picker cards
        document.querySelectorAll('.material-card').forEach(c => {
            c.classList.toggle('active', c.getAttribute('data-material') === STATE.currentMaterial);
        });

        // Sync mode buttons
        const btnCat = document.getElementById('modeBtnCatalog');
        const btnProc = document.getElementById('modeBtnProcedural');
        if (btnCat) btnCat.classList.add('active');
        if (btnProc) btnProc.classList.remove('active');

        // Rebuild 3D wall
        buildWall();
    }

    /**
     * 11. Calculate Specifications & Update UI
     */
    function calculateSpecifications(cols, rows, blockW, blockH) {
        const bw = blockW || STATE.blockWidth || STATE.blockSize;
        const bh = blockH || STATE.blockHeight || STATE.blockSize;
        const pitchX = bw + STATE.mortarGap;
        const pitchY = bh + STATE.mortarGap;
        const actualWidth = (cols * pitchX).toFixed(2);
        const actualHeight = (rows * pitchY).toFixed(2);
        const count = cols * rows;
        const area = (actualWidth * actualHeight).toFixed(2);
        const reserve = Math.ceil(count * 1.05); // +5% safety margin
        const weightPerPc = (bw < 0.15) ? 2.1 : 4.2; // ~2.1kg for 10x20cm, 4.2kg for 20x20cm
        const weight = (reserve * weightPerPc).toFixed(0);

        const unitPrice = STATE.selectedProduct ? STATE.selectedProduct.price : 14000;
        const totalCost = reserve * unitPrice;

        STATE.totalPcs = count;
        STATE.reservePcs = reserve;
        STATE.areaM2 = area;
        STATE.weightKg = weight;
        STATE.totalCost = totalCost;

        // Display labels
        const productName = STATE.selectedProduct
            ? `${STATE.selectedProduct.name} (${STATE.selectedProduct.id})`
            : (PROCEDURAL_MOTIF_NAMES[STATE.currentMotif] || STATE.currentMotif);

        const materialName = STATE.selectedProduct
            ? STATE.selectedProduct.material
            : (MATERIAL_NAMES[STATE.currentMaterial] || STATE.currentMaterial);

        // Update UI elements
        safeText('pillDims', `${actualWidth}m × ${actualHeight}m`);
        safeText('pillPcs', `${reserve} pcs`);
        safeText('pillArea', `${area} m²`);

        safeText('specDims', `${actualWidth} × ${actualHeight} m`);
        safeText('specArea', `${area} m²`);
        safeText('specBasePcs', `${count} pcs`);
        safeText('specReservePcs', `${reserve} pcs`);
        safeText('specWeight', `~${weight} kg`);
        safeText('specMotifName', productName);
        safeText('specMaterialName', materialName);
        safeText('specUnitPrice', `Rp ${unitPrice.toLocaleString('id-ID')} / pcs`);
        safeText('specTotalPrice', `Rp ${totalCost.toLocaleString('id-ID')}`);

        // Update WhatsApp CTA
        updateWhatsAppCTA(actualWidth, actualHeight, area, count, reserve, weight, productName, materialName, unitPrice, totalCost);
    }

    function safeText(elemId, text) {
        const el = document.getElementById(elemId);
        if (el) el.textContent = text;
    }

    /**
     * 12. Dynamic WhatsApp Quotation URL Generator
     */
    function updateWhatsAppCTA(width, height, area, count, reserve, weight, productName, materialName, unitPrice, totalCost) {
        const btn = document.getElementById('btnArchitectWa');
        if (!btn) return;

        const bondName = STATE.bondType === 'running' ? 'Running Bond (Susun Bata)' : 'Stack Bond (Sejajar Grid)';
        const unitPriceStr = `Rp ${unitPrice.toLocaleString('id-ID')} / pcs`;
        const totalCostStr = `Rp ${totalCost.toLocaleString('id-ID')}`;

        const message = `Halo Scarlet Roster, saya arsitek / desainer interior. Saya baru saja menyimulasikan dinding roster di *Studio 3D* dengan produk katalog asli Scarlet Roster:\n\n` +
            `*RINCIAN PRODUK & SPESIFIKASI DINDING:*\n` +
            `• Produk Roster: ${productName}\n` +
            `• Finishing Material: ${materialName}\n` +
            `• Harga Satuan: ${unitPriceStr}\n` +
            `• Dimensi Dinding: ${width} m (Lebar) × ${height} m (Tinggi)\n` +
            `• Total Luas Fasad: ${area} m²\n` +
            `• Pola Pasangan: ${bondName}\n` +
            `• Kebutuhan Roster: ${reserve} pcs (sudah termasuk cadangan 5%)\n` +
            `• Estimasi Total Biaya Roster: ${totalCostStr}\n` +
            `• Estimasi Beban Dinding: ~${weight} kg\n\n` +
            `Mohon informasi ketersediaan stok produk ini di pabrik, estimasi waktu kirim ke proyek saya, dan penawaran harga grosirnya. Terima kasih!`;

        const encoded = encodeURIComponent(message);
        btn.href = `https://wa.me/6283149597892?text=${encoded}`;
    }

    /**
     * 13. Snapshot / Render Capture Tool
     */
    function captureSnapshotHD() {
        renderer.render(scene, camera);
        const dataUrl = renderer.domElement.toDataURL('image/png');

        const a = document.createElement('a');
        const prodId = STATE.selectedProduct ? STATE.selectedProduct.id : STATE.currentMotif;
        const filename = `ScarletRoster_3D_${prodId}_${STATE.wallWidth}x${STATE.wallHeight}m.png`;
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        showToast('Foto Snapshot 3D Berhasil Disimpan!');
    }

    function showToast(msg) {
        let toast = document.getElementById('studioToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'studioToast';
            toast.className = 'studio-toast';
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${msg}</span>`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3200);
    }

    /**
     * 14. Camera Preset Director
     */
    function setCameraPreset(preset) {
        const midY = (STATE.wallHeight / 2) + 0.1;
        controls.target.set(0, midY, 0);

        switch (preset) {
            case 'front':
                camera.position.set(0, midY, STATE.wallWidth * 1.5);
                break;
            case 'iso':
                camera.position.set(STATE.wallWidth * 0.9, midY * 2.0, STATE.wallWidth * 1.2);
                break;
            case 'eye':
                camera.position.set(-STATE.wallWidth * 0.8, 1.6, STATE.wallWidth * 0.9);
                break;
            case 'shadow':
                camera.position.set(STATE.wallWidth * 0.6, 2.2, -STATE.wallWidth * 0.9);
                break;
            case 'single':
                // Close-up 360 degree inspection focused directly on 1 center block
                camera.position.set(0.18, midY + 0.05, 0.45);
                controls.target.set(0, midY, 0);
                break;
        }
        controls.update();
    }

    /**
     * 15. Setup UI Event Listeners
     */
    function setupUIEventListeners() {
        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const targetTab = btn.getAttribute('data-tab');
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                const panel = document.getElementById(`panel-${targetTab}`);
                if (panel) panel.classList.add('active');
            });
        });

        // Mode Switcher: 35 Real Catalog Products vs Procedural 3D Voids
        const modeBtnCatalog = document.getElementById('modeBtnCatalog');
        const modeBtnProcedural = document.getElementById('modeBtnProcedural');
        const catalogModeView = document.getElementById('catalogModeView');
        const proceduralModeView = document.getElementById('proceduralModeView');

        if (modeBtnCatalog && modeBtnProcedural) {
            modeBtnCatalog.addEventListener('click', () => {
                STATE.mode = 'catalog';
                modeBtnCatalog.classList.add('active');
                modeBtnProcedural.classList.remove('active');
                if (catalogModeView) catalogModeView.style.display = 'block';
                if (proceduralModeView) proceduralModeView.style.display = 'none';
                buildWall();
            });

            modeBtnProcedural.addEventListener('click', () => {
                STATE.mode = 'procedural';
                modeBtnProcedural.classList.add('active');
                modeBtnCatalog.classList.remove('active');
                if (catalogModeView) catalogModeView.style.display = 'none';
                if (proceduralModeView) proceduralModeView.style.display = 'block';
                buildWall();
            });
        }

        // Catalog Search Input
        const catalogSearch = document.getElementById('catalogSearch3d');
        if (catalogSearch) {
            catalogSearch.addEventListener('input', (e) => {
                const activeCatBtn = document.querySelector('.category-chip-btn.active');
                const cat = activeCatBtn ? activeCatBtn.getAttribute('data-cat') : 'all';
                renderCatalogProductPicker(cat, e.target.value);
            });
        }

        // Category Chips Filter
        const categoryChips = document.querySelectorAll('.category-chip-btn');
        categoryChips.forEach(chip => {
            chip.addEventListener('click', () => {
                categoryChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const cat = chip.getAttribute('data-cat');
                const searchVal = catalogSearch ? catalogSearch.value : '';
                renderCatalogProductPicker(cat, searchVal);
            });
        });

        // Procedural Motif Cards
        const motifCards = document.querySelectorAll('.motif-card');
        motifCards.forEach(card => {
            card.addEventListener('click', () => {
                motifCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                STATE.currentMotif = card.getAttribute('data-motif');
                STATE.mode = 'procedural';
                buildWall();
            });
        });

        // Dimension Sliders
        const sliderWidth = document.getElementById('sliderWidth');
        if (sliderWidth) {
            sliderWidth.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                STATE.wallWidth = val;
                safeText('valWidth', `${val.toFixed(1)} m`);
                buildWall();
            });
        }

        const sliderHeight = document.getElementById('sliderHeight');
        if (sliderHeight) {
            sliderHeight.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                STATE.wallHeight = val;
                safeText('valHeight', `${val.toFixed(1)} m`);
                buildWall();
            });
        }

        // Bond Type Buttons (Stack vs Running)
        const bondBtns = document.querySelectorAll('.bond-btn');
        bondBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                bondBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                STATE.bondType = btn.getAttribute('data-bond');
                buildWall();
            });
        });

        // Material Finishes Cards
        const materialCards = document.querySelectorAll('.material-card');
        materialCards.forEach(card => {
            card.addEventListener('click', () => {
                materialCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                STATE.currentMaterial = card.getAttribute('data-material');
                buildWall();
            });
        });

        // Sun Simulation Presets (Morning, Noon, Afternoon, Night)
        const sunBtns = document.querySelectorAll('.sun-preset-btn');
        sunBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sunBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const preset = btn.getAttribute('data-sun');
                switch (preset) {
                    case 'morning':
                        STATE.isNightMode = false;
                        STATE.azimuth = 55;
                        STATE.elevation = 26;
                        STATE.sunColor = '#FFF2DE';
                        STATE.sunIntensity = 1.35;
                        break;
                    case 'noon':
                        STATE.isNightMode = false;
                        STATE.azimuth = 180;
                        STATE.elevation = 75;
                        STATE.sunColor = '#FFFFFF';
                        STATE.sunIntensity = 1.6;
                        break;
                    case 'afternoon':
                        STATE.isNightMode = false;
                        STATE.azimuth = 240;
                        STATE.elevation = 22;
                        STATE.sunColor = '#FFE0B2';
                        STATE.sunIntensity = 1.45;
                        break;
                    case 'night':
                        STATE.isNightMode = true;
                        break;
                }
                const sliderAz = document.getElementById('sliderAzimuth');
                if (sliderAz) sliderAz.value = STATE.azimuth;
                const sliderEl = document.getElementById('sliderElevation');
                if (sliderEl) sliderEl.value = STATE.elevation;
                safeText('valAzimuth', `${STATE.azimuth}°`);
                safeText('valElevation', `${STATE.elevation}°`);
                updateSunPosition();
            });
        });

        // Sun Azimuth & Elevation Sliders
        const sliderAzimuth = document.getElementById('sliderAzimuth');
        if (sliderAzimuth) {
            sliderAzimuth.addEventListener('input', (e) => {
                STATE.isNightMode = false;
                STATE.azimuth = parseInt(e.target.value, 10);
                safeText('valAzimuth', `${STATE.azimuth}°`);
                updateSunPosition();
            });
        }

        const sliderElevation = document.getElementById('sliderElevation');
        if (sliderElevation) {
            sliderElevation.addEventListener('input', (e) => {
                STATE.isNightMode = false;
                STATE.elevation = parseInt(e.target.value, 10);
                safeText('valElevation', `${STATE.elevation}°`);
                updateSunPosition();
            });
        }

        // Camera Preset Buttons
        const camBtns = document.querySelectorAll('.cam-btn');
        camBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                camBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                setCameraPreset(btn.getAttribute('data-cam'));
            });
        });

        // Floating Quick Tools
        const btnResetCam = document.getElementById('btnResetCam');
        if (btnResetCam) {
            btnResetCam.addEventListener('click', () => setCameraPreset('iso'));
        }

        const btnSnapshot = document.getElementById('btnSnapshot');
        if (btnSnapshot) {
            btnSnapshot.addEventListener('click', captureSnapshotHD);
        }

        const btnSnapshotHeader = document.getElementById('btnSnapshotHeader');
        if (btnSnapshotHeader) {
            btnSnapshotHeader.addEventListener('click', captureSnapshotHD);
        }

        // Fullscreen Toggle
        const btnFullscreen = document.getElementById('btnFullscreen');
        if (btnFullscreen) {
            btnFullscreen.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            });
        }

        // Mobile Drawer Toggle & Close
        const mobileToggle = document.getElementById('mobileDrawerToggle');
        const btnCloseDrawer = document.getElementById('btnCloseDrawer');
        const sidebar = document.querySelector('.studio-sidebar');
        if (mobileToggle && sidebar) {
            mobileToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }
        if (btnCloseDrawer && sidebar) {
            btnCloseDrawer.addEventListener('click', () => {
                sidebar.classList.remove('open');
            });
        }
    }

    /**
     * 16. Render Loop
     */
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    /**
     * 17. Responsive Resize
     */
    function onWindowResize() {
        const container = document.getElementById('threejs-canvas-container');
        if (!container || !renderer || !camera) return;

        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }

    // Auto-init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStudio);
    } else {
        initStudio();
    }
})();
