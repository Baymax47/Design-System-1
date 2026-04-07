/**
 * Figma Variables Export Script
 * ─────────────────────────────
 * Reads design-system/dist/tokens.json and pushes them to a Figma file
 * as Variable Collections using the Figma REST API v1.
 *
 * Prerequisites:
 *   1. Set FIGMA_ACCESS_TOKEN in .env  (Personal Access Token or OAuth)
 *   2. Set FIGMA_FILE_ID in .env       (from the Figma file URL)
 *   3. Run: npm run ds:build           (generates dist/tokens.json first)
 *
 * Usage:  npm run ds:figma
 *
 * Figma API Docs:
 *   https://www.figma.com/developers/api#variables
 */

require('dotenv').config();
const fs   = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────
const FIGMA_TOKEN   = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;
const TOKENS_PATH   = path.join(__dirname, '../dist/tokens.json');

// ─── Validation ───────────────────────────────────────────────────────────────
if (!FIGMA_TOKEN) {
  console.error('\n❌  FIGMA_ACCESS_TOKEN is not set in your .env file.\n');
  console.error('   Get your token at: https://www.figma.com/settings → Personal access tokens\n');
  process.exit(1);
}

if (!FIGMA_FILE_ID) {
  console.error('\n❌  FIGMA_FILE_ID is not set in your .env file.\n');
  console.error('   Copy the ID from your Figma file URL:\n');
  console.error('   https://www.figma.com/file/<FILE_ID>/Your-File-Name\n');
  process.exit(1);
}

if (!fs.existsSync(TOKENS_PATH)) {
  console.error('\n❌  dist/tokens.json not found. Run `npm run ds:build` first.\n');
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8'));

/**
 * Convert a CSS hex color to Figma RGBA (0-1 range)
 */
function hexToFigmaColor(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return { r, g, b, a: 1 };
}

/**
 * Try to parse a CSS color value into Figma RGBA
 */
function parseCssColor(value) {
  if (typeof value !== 'string') return null;
  value = value.trim();
  if (value.startsWith('#')) {
    return hexToFigmaColor(value);
  }
  // rgba(r, g, b, a)
  const rgbaMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1]) / 255,
      g: parseInt(rgbaMatch[2]) / 255,
      b: parseInt(rgbaMatch[3]) / 255,
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1,
    };
  }
  return null;
}

/**
 * Map token type to Figma variable type
 */
function figmaVarType(tokenType) {
  switch (tokenType) {
    case 'color': return 'COLOR';
    case 'fontSizes':
    case 'sizing':
    case 'spacing':
    case 'borderRadius':
    case 'borderWidth':
    case 'lineHeights': return 'FLOAT';
    default: return 'STRING';
  }
}

/**
 * Convert a token value to the Figma value format
 */
function figmaValue(value, type) {
  const figmaType = figmaVarType(type);

  if (figmaType === 'COLOR') {
    const color = parseCssColor(value);
    return color || { r: 0, g: 0, b: 0, a: 1 };
  }

  if (figmaType === 'FLOAT') {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  return String(value);
}

/**
 * Group tokens by their top-level category
 */
function groupByCategory(tokenMap) {
  const groups = {};
  for (const [key, meta] of Object.entries(tokenMap)) {
    const category = key.split('.')[0];
    if (!groups[category]) groups[category] = [];
    groups[category].push({ key, ...meta });
  }
  return groups;
}

// ─── Figma API ────────────────────────────────────────────────────────────────
async function figmaPost(endpoint, body) {
  const url = `https://api.figma.com/v1${endpoint}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Figma-Token': FIGMA_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Figma API ${res.status}: ${json.message || JSON.stringify(json)}`);
  }
  return json;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🎨  Design System → Figma Variables Export\n');
  console.log(`   File ID : ${FIGMA_FILE_ID}`);
  console.log(`   Tokens  : ${Object.keys(tokens).length} total\n`);

  const groups = groupByCategory(tokens);
  const results = [];

  for (const [collection, tokenList] of Object.entries(groups)) {
    const collectionName = collection.charAt(0).toUpperCase() + collection.slice(1) + ' Tokens';
    const variables = tokenList.map(t => ({
      action: 'CREATE',
      variableCollectionId: null, // will be resolved
      name: t.key,
      resolvedType: figmaVarType(t.type || 'other'),
      valuesByMode: {
        default: figmaValue(t.value, t.type || 'other'),
      },
      description: t.description || '',
    }));

    try {
      process.stdout.write(`   → Pushing "${collectionName}" (${variables.length} variables)...`);

      await figmaPost(`/files/${FIGMA_FILE_ID}/variables`, {
        variableCollections: [{ action: 'CREATE', name: collectionName, initialModeId: 'default' }],
        variables,
      });

      console.log(' ✓');
      results.push({ collection: collectionName, count: variables.length, status: 'ok' });
    } catch (err) {
      console.log(` ✗`);
      console.error(`     Error: ${err.message}`);
      results.push({ collection: collectionName, count: variables.length, status: 'error', error: err.message });
    }
  }

  // Summary
  console.log('\n──────────────────────────────────────────────\n');
  const ok = results.filter(r => r.status === 'ok');
  const fail = results.filter(r => r.status === 'error');
  console.log(`   ✅  ${ok.length} collections exported successfully`);
  if (fail.length) {
    console.log(`   ❌  ${fail.length} collections failed`);
    fail.forEach(r => console.log(`       - ${r.collection}: ${r.error}`));
  }

  const totalVars = ok.reduce((s, r) => s + r.count, 0);
  console.log(`\n   🔢  ${totalVars} variables pushed to Figma\n`);
  console.log('   Open Figma → Assets panel → Local variables to see them.\n');
}

main().catch(err => {
  console.error('\n💥  Fatal error:', err.message);
  process.exit(1);
});
