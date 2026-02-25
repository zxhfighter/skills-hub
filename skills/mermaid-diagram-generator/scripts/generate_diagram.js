#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Parse command line arguments
function parseArgs() {
  const args = {};
  let output = null;
  let code = null;

  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      if (key === 'output' || key === 'o') {
        output = value;
      } else if (key === 'code') {
        // Code may contain spaces, so collect all remaining args
        const idx = process.argv.indexOf(arg);
        code = process.argv.slice(idx + 1).join(' ');
        args[key] = code;
      } else {
        args[key] = value || true;
      }
    }
  });

  args.output = output || 'diagram.png';
  return args;
}

// Validate inputs
function validateArgs(args) {
  if (!args.type) {
    console.error('Error: --type is required');
    console.error('Available types: flowchart, sequence, gantt, classDiagram, stateDiagram, erDiagram, pie, mindmap');
    process.exit(1);
  }

  if (!args.code) {
    console.error('Error: --code is required');
    process.exit(1);
  }

  if (!args.output) {
    console.error('Error: --output or -o is required');
    process.exit(1);
  }

  // Add title if provided
  let mermaidCode = args.code;
  if (args.title) {
    mermaidCode = `${args.type}\n    title ${args.title}\n    ${mermaidCode.substring(args.type.length).trim()}`;
  }

  return mermaidCode;
}

// Generate diagram using mermaid CLI
function generateDiagram(mermaidCode, outputFile, options = {}) {
  return new Promise((resolve, reject) => {
    // Create temporary file for mermaid code
    const tempFile = path.join(__dirname, 'temp.mmd');
    fs.writeFileSync(tempFile, mermaidCode, 'utf8');

    // Build mmdc command
    const cmdArgs = [
      '-i', tempFile,
      '-o', outputFile,
      '-s', (options.scale || 2).toString(), // Scale for higher quality
      '-b', (options.background || 'transparent')
    ];

    // Add theme if specified
    if (options.theme) {
      cmdArgs.push('-t', options.theme);
    }

    const cmd = `mmdc ${cmdArgs.join(' ')}`;

    console.log(`Generating diagram with mermaid CLI...`);
    console.log(`Type: ${options.type}`);
    console.log(`Output: ${outputFile}`);

    exec(cmd, (error, stdout, stderr) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempFile);
      } catch (e) {
        // Ignore cleanup errors
      }

      if (error) {
        // Check if mmdc is installed
        if (error.message.includes('command not found') || error.code === 127) {
          console.error('Error: mermaid CLI (mmdc) not found');
          console.error('Install it with: npm install -g @mermaid-js/mermaid-cli');
        } else {
          console.error('Error generating diagram:');
          console.error(stderr || error.message);
        }
        reject(error);
        return;
      }

      console.log(`✅ Diagram generated successfully: ${outputFile}`);
      console.log(`Size: ${fs.statSync(outputFile).size} bytes`);

      resolve({
        outputFile,
        size: fs.statSync(outputFile).size,
        success: true
      });
    });
  });
}

// Main function
async function main() {
  try {
    const args = parseArgs();
    const mermaidCode = validateArgs(args);

    const options = {
      type: args.type,
      title: args.title,
      scale: args.scale || 2,
      background: args.background || 'transparent',
      theme: args.theme || 'default'
    };

    await generateDiagram(mermaidCode, args.output, options);

    // Output the path for OpenClaw to capture
    console.log(`MEDIA: ${path.resolve(args.output)}`);

  } catch (error) {
    console.error('Failed to generate diagram:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { generateDiagram, parseArgs, validateArgs };
