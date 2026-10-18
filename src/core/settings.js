export const QUALITY = Object.freeze({
  low: { pixelRatioCap: 1, shadowSize: 0, antialias: false },
  medium: { pixelRatioCap: 1.5, shadowSize: 1024, antialias: true },
  high: { pixelRatioCap: 2, shadowSize: 2048, antialias: true }
});
export const DEFAULTS = Object.freeze({
  quality: 'medium',
  object: 'stone',
  camera: { x: 8.5, y: 6.2, z: 10.5, target: [0, 0.8, 0] }
});
export function validateState(candidate) {
  if (!candidate || typeof candidate !== 'object') return structuredClone(DEFAULTS);
  const q = Object.hasOwn(QUALITY, candidate.quality) ? candidate.quality : DEFAULTS.quality;
  const o = ['stone','wood','ceramic'].includes(candidate.object) ? candidate.object : DEFAULTS.object;
  const c = candidate.camera;
  const valid = c && [c.x,c.y,c.z].every(v=>typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= 50)
    && Array.isArray(c.target) && c.target.length === 3 && c.target.every(v=>typeof v === 'number' && Number.isFinite(v) && Math.abs(v) <= 50);
  const camera = valid ? { x:c.x, y:c.y, z:c.z, target:[...c.target] } : structuredClone(DEFAULTS.camera);
  return { quality:q, object:o, camera };
}
