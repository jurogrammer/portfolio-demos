import path from 'path';
import fs from 'fs';

const ROOT = path.resolve(import.meta.dirname, '..');

function warn(msg) {
  console.warn(`[normalize-tokens] WARNING: ${msg}`);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
  console.log(`[normalize-tokens] Written: ${filePath}`);
}

function get(obj, keyPath) {
  return keyPath.split('.').reduce((acc, k) => (acc != null ? acc[k] : undefined), obj);
}

function colorToken(value) {
  return { $type: 'color', $value: value };
}
function dimensionToken(value) {
  return { $type: 'dimension', $value: typeof value === 'number' ? `${value}px` : value };
}
function fontFamilyToken(value) {
  return { $type: 'fontFamily', $value: value };
}
function fontWeightToken(value) {
  return { $type: 'fontWeight', $value: value };
}

function buildPrimitiveColors(essence) {
  const tokens = {};

  const colorMap = {
    'color.primary': 'primary',
    'color.secondary': 'secondary',
    'color.accent': 'accent',
    'color.background.main': 'bg-main',
    'color.background.alt': 'bg-alt',
    'color.text.heading': 'text-heading',
    'color.text.body': 'text-body',
    'color.text.muted': 'text-muted',
  };

  for (const [srcPath, destKey] of Object.entries(colorMap)) {
    const value = get(essence, srcPath);
    if (value == null) {
      warn(`Missing color: ${srcPath}`);
      continue;
    }
    tokens[destKey] = colorToken(value);
  }

  return tokens;
}

function buildPrimitiveTypography(essence) {
  const tokens = {};

  // Font families
  const families = {
    'typography.heading_font.family': 'family.heading',
    'typography.body_font.family': 'family.body',
    'typography.accent_font.family': 'family.accent',
  };

  for (const [srcPath, destPath] of Object.entries(families)) {
    const value = get(essence, srcPath);
    if (value == null) {
      if (srcPath !== 'typography.accent_font.family') warn(`Missing typography: ${srcPath}`);
      continue;
    }
    const parts = destPath.split('.');
    let node = tokens;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) node[parts[i]] = {};
      node = node[parts[i]];
    }
    node[parts[parts.length - 1]] = fontFamilyToken(value);
  }

  // Font sizes — handle compound values like "68px / 700" (size / weight)
  const scaleKeys = ['h1', 'h2', 'h3', 'body'];
  for (const key of scaleKeys) {
    let value = get(essence, `typography.scale.${key}`);
    if (value == null) {
      warn(`Missing typography.scale.${key}`);
      continue;
    }
    if (!tokens.size) tokens.size = {};
    // Split compound "68px / 700" or "18px / 1.33" — take only the size part
    if (typeof value === 'string' && value.includes('/')) {
      const parts = value.split('/').map(s => s.trim());
      value = parts[0]; // size portion (e.g. "68px")
    }
    tokens.size[key] = dimensionToken(value);
  }

  // Font weights
  const weightUsage = get(essence, 'typography.weight_usage');
  if (weightUsage) {
    for (const [key, value] of Object.entries(weightUsage)) {
      if (!tokens.weight) tokens.weight = {};
      tokens.weight[key] = fontWeightToken(value);
    }
  } else {
    warn('Missing typography.weight_usage');
  }

  return tokens;
}

function buildPrimitiveSpacing(essence) {
  const tokens = {};
  const maxWidth = get(essence, 'layout.max_width');
  if (maxWidth == null) {
    warn('Missing layout.max_width');
  } else {
    tokens['container-max'] = dimensionToken(maxWidth);
  }
  return tokens;
}

function buildSemanticColors() {
  // Nested under "semantic.color" to avoid CSS var name collisions with
  // primitive flat keys like color.text-heading vs color.text.heading
  return {
    surface: {
      default: { $type: 'color', $value: '{color.bg-main}' },
      alt: { $type: 'color', $value: '{color.bg-alt}' },
    },
    brand: {
      primary: { $type: 'color', $value: '{color.primary}' },
      accent: { $type: 'color', $value: '{color.accent}' },
    },
    text: {
      default: { $type: 'color', $value: '{color.text-body}' },
      heading: { $type: 'color', $value: '{color.text-heading}' },
      muted: { $type: 'color', $value: '{color.text-muted}' },
    },
  };
}

function buildSemanticTypography() {
  // Nested under "semantic.font" to avoid collisions with primitive "font.*"
  return {
    family: {
      // display is an alias for the heading font
      display: { $type: 'fontFamily', $value: '{font.family.heading}' },
    },
  };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/normalize-tokens.js tokens/extracted/DOMAIN/');
    process.exit(1);
  }

  const inputDir = path.resolve(ROOT, args[0]);
  const essencePath = path.join(inputDir, 'essence.json');

  const essence = readJson(essencePath);
  if (!essence) {
    console.error(`[normalize-tokens] ERROR: Cannot find essence.json at ${essencePath}`);
    process.exit(1);
  }

  const primitiveColors = buildPrimitiveColors(essence);
  const primitiveTypography = buildPrimitiveTypography(essence);
  const primitiveSpacing = buildPrimitiveSpacing(essence);
  const semanticColors = buildSemanticColors();
  const semanticTypography = buildSemanticTypography();
  const semanticSpacing = {};

  writeJson(path.join(ROOT, 'tokens/primitive/colors.json'), { color: primitiveColors });
  writeJson(path.join(ROOT, 'tokens/primitive/typography.json'), { font: primitiveTypography });
  writeJson(path.join(ROOT, 'tokens/primitive/spacing.json'), { spacing: primitiveSpacing });
  writeJson(path.join(ROOT, 'tokens/semantic/colors.json'), { semantic: { color: semanticColors } });
  writeJson(path.join(ROOT, 'tokens/semantic/typography.json'), { semantic: { font: semanticTypography } });
  writeJson(path.join(ROOT, 'tokens/semantic/spacing.json'), semanticSpacing);

  console.log('[normalize-tokens] Done.');
}

main();
