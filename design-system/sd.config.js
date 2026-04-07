const StyleDictionary = require('style-dictionary');

// ─── Custom formats ───────────────────────────────────────────────────────────

// Flat JSON for Token Studio / Figma plugin (Option B)
StyleDictionary.registerFormat({
  name: 'json/token-studio',
  formatter({ dictionary }) {
    const result = {};
    dictionary.allTokens.forEach(token => {
      const key = token.path.join('.');
      result[key] = {
        value: token.value,
        type: token.attributes?.type || token.type || 'other',
        description: token.description || '',
      };
    });
    return JSON.stringify(result, null, 2);
  },
});

// JS ES module export
StyleDictionary.registerFormat({
  name: 'javascript/esm',
  formatter({ dictionary }) {
    const lines = dictionary.allTokens.map(token => {
      const key = token.path
        .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
        .join('');
      return `export const ${key} = ${JSON.stringify(token.value)};`;
    });
    return lines.join('\n') + '\n';
  },
});

// ─── Custom transforms ────────────────────────────────────────────────────────

// Convert camelCase path to CSS custom property: color.brand.500 → --color-brand-500
StyleDictionary.registerTransform({
  name: 'name/css-kebab',
  type: 'name',
  transformer(token) {
    return token.path.join('-');
  },
});

// ─── Transform groups ─────────────────────────────────────────────────────────

StyleDictionary.registerTransformGroup({
  name: 'css/custom',
  transforms: ['attribute/cti', 'name/css-kebab', 'color/css', 'size/rem'],
});

// ─── Config ───────────────────────────────────────────────────────────────────

module.exports = {
  source: [
    'design-system/tokens/base.json',
    'design-system/tokens/semantic.json',
    'design-system/tokens/themes/dark.json',
  ],
  platforms: {
    // CSS custom properties — consumed by index.html / showcase.html
    css: {
      transformGroup: 'css/custom',
      prefix: 'ds',
      buildPath: 'public/',
      files: [
        {
          destination: 'design-system.css',
          format: 'css/variables',
          options: {
            selector: ':root',
            outputReferences: false,
          },
        },
      ],
    },
    // Light theme override file
    'css-light': {
      transformGroup: 'css/custom',
      prefix: 'ds',
      source: [
        'design-system/tokens/base.json',
        'design-system/tokens/semantic.json',
        'design-system/tokens/themes/light.json',
      ],
      buildPath: 'public/',
      files: [
        {
          destination: 'design-system-light.css',
          format: 'css/variables',
          options: {
            selector: '[data-theme="light"]',
            outputReferences: false,
          },
        },
      ],
    },
    // Flat JSON for Token Studio Figma plugin
    json: {
      transformGroup: 'js',
      buildPath: 'design-system/dist/',
      files: [
        {
          destination: 'tokens.json',
          format: 'json/token-studio',
        },
      ],
    },
    // JavaScript ES module constants
    js: {
      transformGroup: 'js',
      buildPath: 'design-system/dist/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/esm',
        },
      ],
    },
    // SCSS variables for future framework use
    scss: {
      transformGroup: 'scss',
      buildPath: 'design-system/dist/',
      files: [
        {
          destination: '_tokens.scss',
          format: 'scss/variables',
        },
      ],
    },
  },
};
