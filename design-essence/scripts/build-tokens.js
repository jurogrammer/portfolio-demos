import path from 'path';
import fs from 'fs';
import StyleDictionary from 'style-dictionary';
import config from './sd.config.js';

const ROOT = path.resolve(import.meta.dirname, '..');

function hasTokenFiles(sources) {
  for (const pattern of sources) {
    // Simple check: see if the base directories have any .json files
    const dir = pattern.replace(/\/\*\*\/\*\.json$/, '');
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir, { recursive: true });
      if (files.some((f) => f.endsWith('.json'))) {
        return true;
      }
    }
  }
  return false;
}

async function main() {
  if (!hasTokenFiles(config.source)) {
    console.log('[build-tokens] No token files found. Skipping build.');
    return;
  }

  const sd = new StyleDictionary(config);
  await sd.buildAllPlatforms();

  // Log output file paths
  for (const [platform, platformConfig] of Object.entries(config.platforms)) {
    const buildPath = platformConfig.buildPath;
    if (fs.existsSync(buildPath)) {
      const files = fs.readdirSync(buildPath);
      for (const file of files) {
        console.log(`[build-tokens] Output (${platform}): ${path.join(buildPath, file)}`);
      }
    }
  }

  console.log('[build-tokens] Done.');
}

main().catch((err) => {
  console.error('[build-tokens] Error:', err);
  process.exit(1);
});
