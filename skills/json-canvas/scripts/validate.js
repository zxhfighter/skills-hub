#!/usr/bin/env node

/**
 * JSON Canvas Validator
 * Validates .canvas files against JSON Canvas Spec 1.0
 * https://jsoncanvas.org/spec/1.0/
 *
 * Usage: node validate.js <file.canvas>
 */

const fs = require('fs');
const path = require('path');

// --- Constants ---

const VALID_NODE_TYPES = ['text', 'file', 'link', 'group'];
const VALID_SIDES = ['top', 'right', 'bottom', 'left'];
const VALID_ENDS = ['none', 'arrow'];
const VALID_BG_STYLES = ['cover', 'ratio', 'repeat'];
const VALID_PRESET_COLORS = ['1', '2', '3', '4', '5', '6'];
const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

// --- Validator ---

function validateCanvas(data) {
  const errors = [];
  const warnings = [];

  // Top-level structure
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    errors.push('Root must be a JSON object');
    return { errors, warnings };
  }

  const allowedTopKeys = new Set(['nodes', 'edges']);
  for (const key of Object.keys(data)) {
    if (!allowedTopKeys.has(key)) {
      warnings.push(`Unknown top-level key: "${key}"`);
    }
  }

  const nodes = data.nodes || [];
  const edges = data.edges || [];

  if (data.nodes !== undefined && !Array.isArray(nodes)) {
    errors.push('"nodes" must be an array');
    return { errors, warnings };
  }
  if (data.edges !== undefined && !Array.isArray(edges)) {
    errors.push('"edges" must be an array');
    return { errors, warnings };
  }

  // Collect all IDs for uniqueness check
  const allIds = new Set();

  // Validate nodes
  const nodeIds = new Set();
  nodes.forEach((node, i) => {
    const prefix = `nodes[${i}]`;

    // Required generic attributes
    if (!node.id) {
      errors.push(`${prefix}: missing required "id"`);
    } else {
      if (allIds.has(node.id)) {
        errors.push(`${prefix}: duplicate id "${node.id}"`);
      }
      allIds.add(node.id);
      nodeIds.add(node.id);
    }

    if (!node.type) {
      errors.push(`${prefix}: missing required "type"`);
    } else if (!VALID_NODE_TYPES.includes(node.type)) {
      errors.push(`${prefix}: invalid type "${node.type}" (must be ${VALID_NODE_TYPES.join('/')})`);
    }

    for (const attr of ['x', 'y', 'width', 'height']) {
      if (node[attr] === undefined) {
        errors.push(`${prefix}: missing required "${attr}"`);
      } else if (typeof node[attr] !== 'number' || !Number.isInteger(node[attr])) {
        errors.push(`${prefix}: "${attr}" must be an integer (got ${typeof node[attr]})`);
      }
    }

    // Color (optional)
    if (node.color !== undefined) {
      validateColor(node.color, `${prefix}.color`, errors);
    }

    // Type-specific validation
    if (node.type === 'text') {
      if (node.text === undefined) {
        errors.push(`${prefix}: text node missing required "text"`);
      } else if (typeof node.text !== 'string') {
        errors.push(`${prefix}: "text" must be a string`);
      }
    }

    if (node.type === 'file') {
      if (node.file === undefined) {
        errors.push(`${prefix}: file node missing required "file"`);
      } else if (typeof node.file !== 'string') {
        errors.push(`${prefix}: "file" must be a string`);
      }
      if (node.subpath !== undefined) {
        if (typeof node.subpath !== 'string') {
          errors.push(`${prefix}: "subpath" must be a string`);
        } else if (!node.subpath.startsWith('#')) {
          errors.push(`${prefix}: "subpath" must start with "#"`);
        }
      }
    }

    if (node.type === 'link') {
      if (node.url === undefined) {
        errors.push(`${prefix}: link node missing required "url"`);
      } else if (typeof node.url !== 'string') {
        errors.push(`${prefix}: "url" must be a string`);
      }
    }

    if (node.type === 'group') {
      if (node.label !== undefined && typeof node.label !== 'string') {
        errors.push(`${prefix}: "label" must be a string`);
      }
      if (node.background !== undefined && typeof node.background !== 'string') {
        errors.push(`${prefix}: "background" must be a string`);
      }
      if (node.backgroundStyle !== undefined) {
        if (!VALID_BG_STYLES.includes(node.backgroundStyle)) {
          errors.push(`${prefix}: invalid backgroundStyle "${node.backgroundStyle}" (must be ${VALID_BG_STYLES.join('/')})`);
        }
      }
    }
  });

  // Validate edges
  edges.forEach((edge, i) => {
    const prefix = `edges[${i}]`;

    // Required attributes
    if (!edge.id) {
      errors.push(`${prefix}: missing required "id"`);
    } else {
      if (allIds.has(edge.id)) {
        errors.push(`${prefix}: duplicate id "${edge.id}"`);
      }
      allIds.add(edge.id);
    }

    if (!edge.fromNode) {
      errors.push(`${prefix}: missing required "fromNode"`);
    } else if (!nodeIds.has(edge.fromNode)) {
      errors.push(`${prefix}: fromNode "${edge.fromNode}" references non-existent node`);
    }

    if (!edge.toNode) {
      errors.push(`${prefix}: missing required "toNode"`);
    } else if (!nodeIds.has(edge.toNode)) {
      errors.push(`${prefix}: toNode "${edge.toNode}" references non-existent node`);
    }

    // Optional attributes
    if (edge.fromSide !== undefined && !VALID_SIDES.includes(edge.fromSide)) {
      errors.push(`${prefix}: invalid fromSide "${edge.fromSide}" (must be ${VALID_SIDES.join('/')})`);
    }
    if (edge.toSide !== undefined && !VALID_SIDES.includes(edge.toSide)) {
      errors.push(`${prefix}: invalid toSide "${edge.toSide}" (must be ${VALID_SIDES.join('/')})`);
    }
    if (edge.fromEnd !== undefined && !VALID_ENDS.includes(edge.fromEnd)) {
      errors.push(`${prefix}: invalid fromEnd "${edge.fromEnd}" (must be ${VALID_ENDS.join('/')})`);
    }
    if (edge.toEnd !== undefined && !VALID_ENDS.includes(edge.toEnd)) {
      errors.push(`${prefix}: invalid toEnd "${edge.toEnd}" (must be ${VALID_ENDS.join('/')})`);
    }
    if (edge.color !== undefined) {
      validateColor(edge.color, `${prefix}.color`, errors);
    }
    if (edge.label !== undefined && typeof edge.label !== 'string') {
      errors.push(`${prefix}: "label" must be a string`);
    }
  });

  return { errors, warnings };
}

function validateColor(color, path, errors) {
  if (typeof color !== 'string') {
    errors.push(`${path}: color must be a string`);
    return;
  }
  if (!VALID_PRESET_COLORS.includes(color) && !HEX_COLOR_REGEX.test(color)) {
    errors.push(`${path}: invalid color "${color}" (must be preset "1"-"6" or hex "#RRGGBB")`);
  }
}

// --- CLI ---

function main() {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: node validate.js <file.canvas>');
    console.error('       node validate.js --stdin  (read from stdin)');
    process.exit(1);
  }

  let rawJson;

  if (filePath === '--stdin') {
    rawJson = fs.readFileSync(0, 'utf8');
  } else {
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      console.error(`Error: file not found: ${resolved}`);
      process.exit(1);
    }
    rawJson = fs.readFileSync(resolved, 'utf8');
  }

  let data;
  try {
    data = JSON.parse(rawJson);
  } catch (err) {
    console.error(`❌ Invalid JSON: ${err.message}`);
    process.exit(1);
  }

  const { errors, warnings } = validateCanvas(data);

  if (warnings.length > 0) {
    warnings.forEach(w => console.warn(`⚠️  ${w}`));
  }

  if (errors.length > 0) {
    console.error(`\n❌ Validation failed with ${errors.length} error(s):\n`);
    errors.forEach(e => console.error(`   • ${e}`));
    process.exit(1);
  }

  const nodeCount = (data.nodes || []).length;
  const edgeCount = (data.edges || []).length;
  console.log(`✅ Valid JSON Canvas (${nodeCount} nodes, ${edgeCount} edges)`);
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { validateCanvas };
