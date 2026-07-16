import fs from 'fs';
import path from 'path';

const distPath = path.join(process.cwd(), 'dist');
const assetsPath = path.join(distPath, 'assets');

if (!fs.existsSync(distPath)) {
  console.error('❌ Build directory not found!');
  process.exit(1);
}

const assets = fs.readdirSync(assetsPath);
const cssFiles = assets.filter(file => file.endsWith('.css'));

if (cssFiles.length === 0) {
  console.error('❌ No CSS file found in dist/assets!');
  process.exit(1);
}

console.log('✅ CSS bundle verified:', cssFiles.join(', '));
