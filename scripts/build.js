#!/usr/bin/env node

/**
 * Simple build script for Brevo MCP Server
 * Copies source files to dist directory
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('Created dist directory');
}

// Files to copy from root
const rootFiles = ['index.js'];

// Copy files from root to dist
rootFiles.forEach(file => {
  const srcPath = path.join(rootDir, file);
  const destPath = path.join(distDir, file);
  
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to dist/`);
  }
});

// If src directory exists, copy its contents
if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir);
  files.forEach(file => {
    if (file.endsWith('.js')) {
      fs.copyFileSync(
        path.join(srcDir, file),
        path.join(distDir, file)
      );
      console.log(`Copied src/${file} to dist/`);
    }
  });
}

console.log('Build completed successfully!');
