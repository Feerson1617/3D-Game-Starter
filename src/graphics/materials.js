import * as THREE from 'three';

// Original, procedurally generated preview textures; no external accounts/assets.
function texture(kind, size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D wird von diesem Gerät nicht unterstützt.');
  const image = ctx.createImageData(size, size);
  let seed = kind === 'wood' ? 781 : kind === 'stone' ? 1283 : 37;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const p = (y * size + x) * 4;
    const grain = kind === 'wood'
      ? 25*Math.sin(y * .20 + 3*Math.sin(x*.025)) + 9*Math.sin(y*.93)
      : 13*Math.sin(x*.16 + Math.cos(y*.25)) + 10*Math.sin(y*.13);
    const noise = (rnd() - .5) * (kind === 'wood' ? 27 : 44);
    const base = kind === 'wood' ? [112,75,41] : [118,124,119];
    for (let i=0; i<3; i++) image.data[p+i] = Math.max(0, Math.min(255, base[i] + grain + noise));
    image.data[p+3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.anisotropy = 2;
  return map;
}
export function createMaterials() {
  const stoneMap = texture('stone');
  const woodMap = texture('wood');
  const groundMap = texture('stone');
  groundMap.repeat.set(8, 8);
  return {
    stone: new THREE.MeshStandardMaterial({ map: stoneMap, roughness: .91, metalness: .02 }),
    wood: new THREE.MeshStandardMaterial({ map: woodMap, roughness: .76, metalness: 0 }),
    ground: new THREE.MeshStandardMaterial({ map: groundMap, color: 0x8ca28d, roughness: 1 }),
    ceramic: new THREE.MeshPhysicalMaterial({ color: 0xc9d1cd, metalness: .04, roughness: .18, clearcoat: .62, clearcoatRoughness: .17 })
  };
}
export function disposeMaterials(materials) {
  for (const material of Object.values(materials)) {
    material.map?.dispose();
    material.dispose();
  }
}
