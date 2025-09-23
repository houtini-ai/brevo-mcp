#!/usr/bin/env node

/**
 * Build script for Brevo MCP Server
 * Copies all source files to dist directory maintaining structure
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

// Function to copy directory recursively
function copyDir(src, dest) {
  // Create destination directory
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules and other build directories
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
        continue;
      }
      // Recursively copy subdirectory
      copyDir(srcPath, destPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      // Copy JavaScript files
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${path.relative(rootDir, srcPath)} to ${path.relative(rootDir, destPath)}`);
    }
  }
}

// Clear dist directory first (except backup files)
if (fs.existsSync(distDir)) {
  const files = fs.readdirSync(distDir);
  files.forEach(file => {
    if (!file.endsWith('.backup')) {
      const filePath = path.join(distDir, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true });
      } else {
        fs.unlinkSync(filePath);
      }
    }
  });
}

// Copy entire src directory structure to dist
console.log('Building Brevo MCP Server...');
copyDir(srcDir, distDir);

console.log('\nBuild completed successfully!');
console.log(`Output directory: ${path.relative(rootDir, distDir)}`);
