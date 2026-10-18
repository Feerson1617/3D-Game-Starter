import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Use local, license-checked assets committed under public/models/.
// The relative Vite base makes this work from /REPO/ and /REPO/pr-preview/pr-N/.
export async function loadGLB(filename) {
  if (typeof filename !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_./-]*\.glb$/i.test(filename)
    || filename.split('/').some(part => part === '.' || part === '..' || !part)) {
    throw new Error('Ungültiger GLB-Dateiname. Nur Dateien unter public/models/ sind erlaubt.');
  }
  const url = new URL(`${import.meta.env.BASE_URL}models/${filename}`, document.baseURI);
  return new GLTFLoader().loadAsync(url.href);
}
