#!/usr/bin/env node

/**
 * Fix build script - copies the source index.js to dist
 * This resolves the API key validation issue on startup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname);
const distDir = path.join(rootDir, 'dist');

console.log('🔧 Fixing Brevo MCP Server build...\n');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('✅ Created dist directory');
}

// Backup current dist/index.js
const distIndexPath = path.join(distDir, 'index.js');
if (fs.existsSync(distIndexPath)) {
  const backupPath = path.join(distDir, 'index.js.backup');
  fs.copyFileSync(distIndexPath, backupPath);
  console.log('📦 Backed up current dist/index.js to dist/index.js.backup');
}

// Copy source index.js to dist
const srcPath = path.join(rootDir, 'index.js');
fs.copyFileSync(srcPath, distIndexPath);
console.log('✅ Copied source index.js to dist/index.js');

console.log('\n✨ Build fix completed!');
console.log('\nThe server should now start without requiring an API key.');
console.log('You can set BREVO_API_KEY later when you\'re ready to use the API.');
