#!/usr/bin/env node

/**
 * JSON Canvas Generator
 * Generate .canvas files from templates (mindmap, kanban, flowchart)
 *
 * Usage:
 *   node generate.js --template mindmap --title "Topic" --items "A,B,C" -o output.canvas
 *   node generate.js --template kanban --title "Sprint" --items "Task A,Task B" -o board.canvas
 *   node generate.js --template flowchart --title "Process" --items "Start,Step 1,End" -o flow.canvas
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- Helpers ---

function genId() {
  return crypto.randomBytes(8).toString('hex');
}

function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-o' || arg === '--output') {
      args.output = argv[++i];
    } else if (arg.startsWith('--')) {
      const key = arg.slice(2);
      args[key] = argv[++i] || true;
    }
  }

  return args;
}

// --- Templates ---

function generateMindmap(title, items) {
  const nodes = [];
  const edges = [];

  // Central node
  const centerId = genId();
  nodes.push({
    id: centerId,
    type: 'text',
    x: 0,
    y: 0,
    width: 300,
    height: 150,
    text: `# ${title}`,
    color: '5',
  });

  // Branch nodes — fan out to the right
  const startY = -((items.length - 1) * 70);
  items.forEach((item, i) => {
    const nodeId = genId();
    nodes.push({
      id: nodeId,
      type: 'text',
      x: 400,
      y: startY + i * 140,
      width: 250,
      height: 100,
      text: `## ${item}`,
    });
    edges.push({
      id: genId(),
      fromNode: centerId,
      fromSide: 'right',
      toNode: nodeId,
      toSide: 'left',
    });
  });

  return { nodes, edges };
}

function generateKanban(title, items) {
  const columns = ['To Do', 'In Progress', 'Done'];
  const columnColors = ['1', '3', '4'];
  const columnWidth = 300;
  const gap = 50;
  const nodes = [];

  // Group nodes for columns
  columns.forEach((label, i) => {
    nodes.push({
      id: genId(),
      type: 'group',
      x: i * (columnWidth + gap),
      y: 0,
      width: columnWidth,
      height: 500,
      label,
      color: columnColors[i],
    });
  });

  // Place items as cards in "To Do" column
  items.forEach((item, i) => {
    nodes.push({
      id: genId(),
      type: 'text',
      x: 20,
      y: 50 + i * 100,
      width: 260,
      height: 80,
      text: `## ${item}`,
    });
  });

  return { nodes, edges: [] };
}

function generateFlowchart(title, items) {
  const nodes = [];
  const edges = [];
  const stepHeight = 60;
  const gap = 40;
  const nodeWidth = 200;

  items.forEach((item, i) => {
    const isFirst = i === 0;
    const isLast = i === items.length - 1;
    const nodeId = genId();
    const color = isFirst || isLast ? '4' : undefined;

    const node = {
      id: nodeId,
      type: 'text',
      x: 0,
      y: i * (stepHeight + gap),
      width: nodeWidth,
      height: stepHeight,
      text: isFirst ? `**${item}**` : isLast ? `**${item}**` : item,
    };
    if (color) node.color = color;
    nodes.push(node);

    // Edge to next node
    if (i > 0) {
      edges.push({
        id: genId(),
        fromNode: nodes[i - 1].id,
        fromSide: 'bottom',
        toNode: nodeId,
        toSide: 'top',
      });
    }
  });

  return { nodes, edges };
}

const TEMPLATES = {
  mindmap: generateMindmap,
  kanban: generateKanban,
  flowchart: generateFlowchart,
};

// --- Main ---

function main() {
  const args = parseArgs();

  if (!args.template) {
    console.error('Usage: node generate.js --template <mindmap|kanban|flowchart> --title "..." --items "A,B,C" -o output.canvas');
    console.error(`\nAvailable templates: ${Object.keys(TEMPLATES).join(', ')}`);
    process.exit(1);
  }

  const generator = TEMPLATES[args.template];
  if (!generator) {
    console.error(`Unknown template: "${args.template}". Available: ${Object.keys(TEMPLATES).join(', ')}`);
    process.exit(1);
  }

  const title = args.title || 'Untitled';
  const items = args.items ? args.items.split(',').map(s => s.trim()) : ['Item 1', 'Item 2', 'Item 3'];
  const output = args.output || `${args.template}.canvas`;

  const canvas = generator(title, items);

  const json = JSON.stringify(canvas, null, 2);

  // Write file
  const outPath = path.resolve(output);
  fs.writeFileSync(outPath, json, 'utf8');

  console.log(`✅ Generated ${args.template} canvas: ${outPath}`);
  console.log(`   Nodes: ${canvas.nodes.length}, Edges: ${(canvas.edges || []).length}`);

  // Auto-validate if validate.js exists alongside
  const validatePath = path.join(__dirname, 'validate.js');
  if (fs.existsSync(validatePath)) {
    const { validateCanvas } = require(validatePath);
    const { errors } = validateCanvas(canvas);
    if (errors.length > 0) {
      console.error(`\n⚠️  Generated canvas has validation issues:`);
      errors.forEach(e => console.error(`   • ${e}`));
      process.exit(1);
    }
    console.log('   Validation: ✅ passed');
  }
}

if (require.main === module) {
  main();
}

module.exports = { generateMindmap, generateKanban, generateFlowchart, genId };
