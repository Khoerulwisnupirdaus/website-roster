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
        blockDepth: 0.10,     // 10cm depth
        mortarGap: 0.008,     // 8mm architectural joint
        bondType: 'stack',    // 'stack' or 'running'
        currentMotif: 'square', // for procedural mode
        currentMaterial: 'concrete', // concrete, terracotta, white, charcoal
        
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
     * 7. Procedural 3D Void Geometries (Mode Procedural)
     */
    function getBlockGeometry(motifType) {
        if (geometriesMap[motifType]) {
            return geometriesMap[motifType];
        }

        const size = STATE.blockSize;
        const half = size / 2;
        const depth = STATE.blockDepth;

        const shape = new THREE.Shape();
        shape.moveTo(-half, -half);
        shape.lineTo(half, -half);
        shape.lineTo(half, half);
        shape.lineTo(-half, half);
        shape.closePath();

        switch (motifType) {
            case 'square': {
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
        geometriesMap[motifType] = geom;
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

        const blockPitch = STATE.blockSize + STATE.mortarGap;
        const cols = Math.max(2, Math.round(STATE.wallWidth / blockPitch));
        const rows = Math.max(2, Math.round(STATE.wallHeight / blockPitch));
        const totalCount = cols * rows;

        let geometry, material;

        if (STATE.mode === 'catalog' && STATE.selectedProduct) {
            // Real Catalog Product Mode: Texture mapped with authentic product photo
            geometry = new THREE.BoxGeometry(STATE.blockSize, STATE.blockSize, STATE.blockDepth);
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
            geometry = getBlockGeometry(STATE.currentMotif);
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

        const totalWidth = cols * blockPitch;
        const halfWidth = totalWidth / 2;
        let idx = 0;

        for (let r = 0; r < rows; r++) {
            const yPos = (r * blockPitch) + (STATE.blockSize / 2) + 0.08;
            const isOddRow = r % 2 === 1;
            const rowShift = (STATE.bondType === 'running' && isOddRow) ? (blockPitch / 2) : 0;

            for (let c = 0; c < cols; c++) {
                const xPos = (c * blockPitch) - halfWidth + (STATE.blockSize / 2) + rowShift;
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
        calculateSpecifications(cols, rows);
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

            card.innerHTML = `
                <div class="catalog-thumb-wrap">
                    <img src="${product.image}" alt="${product.name}" class="catalog-thumb-img" loading="lazy">
                    <span class="catalog-thumb-badge">${product.id}</span>
                </div>
                <div class="catalog-card-title" title="${product.name}">${product.name}</div>
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
    function calculateSpecifications(cols, rows) {
        const actualWidth = (cols * STATE.blockSize).toFixed(2);
        const actualHeight = (rows * STATE.blockSize).toFixed(2);
        const count = cols * rows;
        const area = (actualWidth * actualHeight).toFixed(2);
        const reserve = Math.ceil(count * 1.05); // +5% safety margin
        const weight = (reserve * 4.2).toFixed(0); // ~4.2kg per piece

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
