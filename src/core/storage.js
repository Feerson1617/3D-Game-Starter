import { validateState } from './settings.js';
// GitHub Pages project sites share an origin; isolate repositories and PR previews.
const scope = globalThis.location?.pathname?.split('/').filter(Boolean).slice(0, 3).join(':') || 'local';
const KEY = `3d-game-starter:${scope}:v1`;
export function saveState(raw, storage = globalThis.localStorage) {
  try { storage.setItem(KEY, JSON.stringify({ version: 1, state: validateState(raw) })); return true; }
  catch { return false; }
}
export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return null;
    const doc = JSON.parse(raw);
    return doc?.version === 1 ? validateState(doc.state) : null;
  } catch { return null; }
}
export function resetState(storage = globalThis.localStorage) {
  try { storage.removeItem(KEY); return true; } catch { return false; }
}
