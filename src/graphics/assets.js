import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Use local, license-checked assets committed under public/models/.
// The relative Vite base makes this work from /REPO/ and /REPO/pr-preview/pr-N/.
export async function loadGLTF(filename, { configureLoader = () => {} } = {}) {
  if (typeof filename !== 'string' || !/^[a-zA-Z0-9][a-zA-Z0-9_./-]*\.(glb|gltf)$/i.test(filename)
    || filename.split('/').some(part => part === '.' || part === '..' || !part)) {
    throw new Error('Ungültiger Modell-Dateiname. Nur GLB/glTF unter public/models/ sind erlaubt.');
  }
  const url = new URL(`${import.meta.env.BASE_URL}models/${filename}`, document.baseURI);
  const loader = new GLTFLoader();
  // Optional local Draco/KTX2/Meshopt decoders; no CDN or extra dependency by default.
  configureLoader(loader);
  try { return await loader.loadAsync(url.href); }
  catch (cause) { throw new Error(`3D-Modell „${filename}“ konnte nicht geladen werden.`, { cause }); }
}

// Preserve the public API of existing projects.
export const loadGLB = loadGLTF;
