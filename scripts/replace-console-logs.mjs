#!/usr/bin/env node
// @ts-check

// Use ES module imports instead of CommonJS require
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Script to automatically replace all console logs with logger utility
 * This is useful for updating any remaining console logs in the project
 */

// Get current file's directory name with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define patterns to search for
const patterns = [
  { regex: /console\.log\(/g, replacement: 'logger.log(' },
  { regex: /console\.error\(/g, replacement: 'logger.error(' },
  { regex: /console\.warn\(/g, replacement: 'logger.warn(' },
  { regex: /console\.info\(/g, replacement: 'logger.info(' },
];

// Define import statement to add
const importStatement = "import { logger } from '@/lib/logger';";

// Skip paths that don't need modification
const skipPaths = [
  'node_modules',
  'dist',
  '.next',
  'scripts',
  'src/lib/logger.ts',
  'src/lib/console-override.ts',
];

// List of file extensions to check
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

// Process a single file
function processFile(filePath) {
  // Skip files we don't want to modify
  if (skipPaths.some(p => filePath.includes(p))) {
    return false;
  }

  // Only process files with the correct extensions
  const ext = path.extname(filePath);
  if (!extensions.includes(ext)) {
    return false;
  }

  try {
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if the file already has logger import
    const hasLoggerImport = content.includes("import { logger }") || 
                            content.includes("import {logger}");
    
    // Check for console patterns
    const hasConsoleStatements = patterns.some(p => p.regex.test(content));

    // Only proceed if there are console statements to replace
    if (hasConsoleStatements) {
      console.log(`Processing: ${filePath}`);

      // Replace all console statements
      patterns.forEach(pattern => {
        // Reset the regex lastIndex
        pattern.regex.lastIndex = 0;
        if (pattern.regex.test(content)) {
          // Reset again since we used it in the test
          pattern.regex.lastIndex = 0;
          content = content.replace(pattern.regex, pattern.replacement);
          modified = true;
        }
      });

      // Add logger import if needed
      if (modified && !hasLoggerImport) {
        // Find a suitable place to insert the import
        const importIndex = content.search(/import .+ from/);
        if (importIndex !== -1) {
          // Find the end of the import statements block
          const importBlockEndIndex = content.indexOf('\n\n', importIndex);
          if (importBlockEndIndex !== -1) {
            // Insert our import after the last import
            content = 
              content.slice(0, importBlockEndIndex) + 
              '\n' + importStatement + 
              content.slice(importBlockEndIndex);
          } else {
            // If no clear end of imports, insert after the first import
            const firstImportEndIndex = content.indexOf('\n', importIndex);
            if (firstImportEndIndex !== -1) {
              content = 
                content.slice(0, firstImportEndIndex) + 
                '\n' + importStatement + 
                content.slice(firstImportEndIndex);
            }
          }
        }
      }

      // Write the modified content back
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Walk through all files recursively
function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Skip directories we don't want to process
      if (!skipPaths.some(p => filePath.includes(p))) {
        results = results.concat(walkDir(filePath));
      }
    } else {
      const modified = processFile(filePath);
      if (modified) {
        results.push(filePath);
      }
    }
  });
  
  return results;
}

// Main execution
console.log("Starting to replace console logs with logger utility...");
const srcDir = path.join(__dirname, '..', 'src');
const modifiedFiles = walkDir(srcDir);

console.log(`\nDone! Modified ${modifiedFiles.length} files:`);
modifiedFiles.forEach(file => {
  console.log(`- ${file.replace(path.join(__dirname, '..'), '')}`);
});
