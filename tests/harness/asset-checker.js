const fs = require('fs');
const path = require('path');
const { ROOT_DIR } = require('./dom-loader');

/**
 * Validates local image headers to ensure assets are valid binary files.
 */
function checkImageHeader(filePath) {
  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(8);
  fs.readSync(fd, buffer, 0, 8, 0);
  fs.closeSync(fd);

  // PNG magic number: 89 50 4E 47 0D 0A 1A 0A
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  // JPEG magic number: FF D8 FF
  const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;

  return { isPng, isJpeg, isValid: isPng || isJpeg };
}

/**
 * Returns all asset files in images directory with metadata.
 */
function getImagesInventory() {
  const imgDir = path.join(ROOT_DIR, 'images');
  if (!fs.existsSync(imgDir)) return [];

  const files = fs.readdirSync(imgDir);
  return files.map(file => {
    const fullPath = path.join(imgDir, file);
    const stats = fs.statSync(fullPath);
    const header = checkImageHeader(fullPath);
    return {
      fileName: file,
      relativePath: `images/${file}`,
      sizeBytes: stats.size,
      isPng: header.isPng,
      isJpeg: header.isJpeg,
      isValidImage: header.isValid
    };
  });
}

/**
 * Checks all local resources referenced in an HTML document.
 */
function auditHtmlLocalAssets(document) {
  const missing = [];
  const found = [];

  // Check <img> tags
  const images = Array.from(document.querySelectorAll('img'));
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('data:')) {
      const cleanSrc = src.split('?')[0];
      const fullPath = path.join(ROOT_DIR, cleanSrc);
      if (fs.existsSync(fullPath)) {
        found.push({ type: 'img', src, fullPath });
      } else {
        missing.push({ type: 'img', src, fullPath });
      }
    }
  });

  // Check <link rel="stylesheet">
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
  styles.forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http://') && !href.startsWith('https://')) {
      const cleanHref = href.split('?')[0];
      const fullPath = path.join(ROOT_DIR, cleanHref);
      if (fs.existsSync(fullPath)) {
        found.push({ type: 'css', href, fullPath });
      } else {
        missing.push({ type: 'css', href, fullPath });
      }
    }
  });

  // Check <script src="...">
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && !src.startsWith('http://') && !src.startsWith('https://')) {
      const cleanSrc = src.split('?')[0];
      const fullPath = path.join(ROOT_DIR, cleanSrc);
      if (fs.existsSync(fullPath)) {
        found.push({ type: 'js', src, fullPath });
      } else {
        missing.push({ type: 'js', src, fullPath });
      }
    }
  });

  return { missing, found };
}

module.exports = {
  checkImageHeader,
  getImagesInventory,
  auditHtmlLocalAssets,
  ROOT_DIR
};
