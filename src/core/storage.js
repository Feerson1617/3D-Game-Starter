import { validateState } from './settings.js';
// GitHub Pages project sites share an origin; isolate repositories and PR previews.
const scope = globalThis.location?.pathname?.split('/').filter(Boolean).slice(0, 3).join(':') || 'local';
const KEY = `3d-game-starter:${scope}:v1`;
export function saveState(raw, storage) {
  try { (storage ?? globalThis.localStorage).setItem(KEY, JSON.stringify({ version: 1, state: validateState(raw) })); return true; }
  catch { return false; }
}
export function loadState(storage) {
  try {
    const raw = (storage ?? globalThis.localStorage).getItem(KEY);
    if (!raw) return null;
    const doc = JSON.parse(raw);
    return doc?.version === 1 ? validateState(doc.state) : null;
  } catch { return null; }
}
export function resetState(storage) {
  try { (storage ?? globalThis.localStorage).removeItem(KEY); return true; } catch { return false; }
}
