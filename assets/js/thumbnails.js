import { THUMBNAILS } from './thumbnail-manifest.js';
import { driveId } from './data.js';

// Match the source image, not row order or a researcher's name.
export function thumbnailSources(profile) {
  const entry = THUMBNAILS[driveId(profile)];
  if (!entry) return null;
  const sources = entry.sources.map(({ file, width }) => ({
    url: new URL(`../images/thumbnails/${file}`, import.meta.url).href, width,
  }));
  return {
    previewSrc: sources.at(-1).url,
    src: sources[Math.min(1, sources.length - 1)].url,
    srcset: sources.map(s => `${s.url} ${s.width}w`).join(', '),
    width: entry.width, height: entry.height,
  };
}
