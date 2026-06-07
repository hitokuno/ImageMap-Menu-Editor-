import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const editorDir = path.resolve(__dirname, '..');
const repoRoot = path.resolve(editorDir, '..');

const distDir = path.join(editorDir, 'dist');
const viewerDir = path.join(repoRoot, 'viewer');
const releaseDir = path.join(repoRoot, 'release');
const releaseEditorDir = path.join(releaseDir, 'editor');
const releaseViewerDir = path.join(releaseDir, 'viewer');

function copyDirectory(source, destination) {
  rmSync(destination, { recursive: true, force: true });
  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}

if (!existsSync(distDir)) {
  throw new Error(`Editor build output not found: ${distDir}`);
}

if (!existsSync(viewerDir)) {
  throw new Error(`Viewer source directory not found: ${viewerDir}`);
}

mkdirSync(releaseDir, { recursive: true });
copyDirectory(distDir, releaseEditorDir);
copyDirectory(viewerDir, releaseViewerDir);

console.log(`Deployed editor to ${releaseEditorDir}`);
console.log(`Deployed viewer to ${releaseViewerDir}`);
