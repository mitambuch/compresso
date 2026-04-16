// ═══════════════════════════════════════════════════
// downloadZip — batch-export compressed images as a single .zip
// ═══════════════════════════════════════════════════

import { saveAs } from 'file-saver';
import JSZip from 'jszip';

import type { ImageItem } from '../types';

export function downloadSingle(item: ImageItem): void {
  if (!item.output) return;
  saveAs(item.output.blob, item.output.filename);
}

export async function downloadAllAsZip(
  items: ImageItem[],
  archiveName = 'compresso',
): Promise<void> {
  const ready = items.filter(item => item.output);
  if (ready.length === 0) return;

  const zip = new JSZip();
  const usedNames = new Set<string>();

  for (const item of ready) {
    if (!item.output) continue;
    let name = item.output.filename;
    // Avoid collisions when two sources share the same base name.
    let attempt = 1;
    while (usedNames.has(name)) {
      const dot = item.output.filename.lastIndexOf('.');
      const base = dot === -1 ? item.output.filename : item.output.filename.slice(0, dot);
      const ext = dot === -1 ? '' : item.output.filename.slice(dot);
      name = `${base}-${attempt}${ext}`;
      attempt += 1;
    }
    usedNames.add(name);
    zip.file(name, item.output.blob);
  }

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  saveAs(blob, `${archiveName}.zip`);
}
