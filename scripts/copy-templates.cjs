// Copies the templates directory into dist so the published package contains them.
const path = require('path');
const fs = require('fs-extra');

async function main() {
  const root = __dirname ? path.join(__dirname, '..') : process.cwd();
  const src = path.join(root, 'templates');
  const dest = path.join(root, 'dist', 'templates');

  const exists = await fs.pathExists(src);
  if (!exists) {
    // Nothing to copy in local dev or if templates were removed
    return;
  }

  await fs.ensureDir(dest);
  await fs.copy(src, dest, { overwrite: true });
  // eslint-disable-next-line no-console
  console.log(`[copy-templates] Copied templates → ${path.relative(root, dest)}`);
}

main().catch((err) => {
  console.error('[copy-templates] Failed to copy templates:', err);
  process.exit(1);
});
