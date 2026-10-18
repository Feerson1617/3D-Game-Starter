import * as THREE from 'three';
import { createMaterials } from './materials.js';

export const OBJECT_DESCRIPTION = Object.freeze({
  stone: 'Prozedural modellierter Naturstein mit einfacher Oberflächenstruktur.',
  wood: 'Testobjekt mit selbst erzeugter Holzmaserung.',
  ceramic: 'Keramik-Testobjekt mit physikalisch plausibler Lichtreflexion.'
});

export function createWorld(scene) {
  const materials = createMaterials();
  const root = new THREE.Group();
  const selectable = {};
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(22,22), materials.ground);
  ground.rotation.x = -Math.PI/2;
  ground.receiveShadow = true;
  root.add(ground);

  const stoneGeo = new THREE.IcosahedronGeometry(1, 3);
  const positions = stoneGeo.attributes.position;
  for (let i=0; i<positions.count; i++) {
    const x=positions.getX(i), y=positions.getY(i), z=positions.getZ(i);
    const v=1 + .085*Math.sin(7*x+2*z)*Math.cos(9*y-3*x) + .035*Math.sin(17*z+4*y);
    positions.setXYZ(i,x*v,y*v,z*v);
  }
  stoneGeo.computeVertexNormals();
  const stone = new THREE.Mesh(stoneGeo, materials.stone);
  stone.position.set(-2, 0.88, 0.45);
  stone.scale.set(1.2,.86,1.0);
  stone.castShadow = stone.receiveShadow = true;
  stone.userData.selectable = 'stone';
  root.add(stone); selectable.stone=stone;

  const wood = new THREE.Mesh(new THREE.CylinderGeometry(.72, .84, 2.7, 32), materials.wood);
  wood.rotation.z = Math.PI / 2.9;
  wood.position.set(1.0, .78, -1.25);
  wood.castShadow = wood.receiveShadow = true;
  wood.userData.selectable = 'wood';
  root.add(wood); selectable.wood=wood;

  const ceramic = new THREE.Mesh(new THREE.SphereGeometry(.95, 48, 32), materials.ceramic);
  ceramic.position.set(2.5,.96,1.25);
  ceramic.castShadow = ceramic.receiveShadow = true;
  ceramic.userData.selectable = 'ceramic';
  root.add(ceramic); selectable.ceramic=ceramic;

  const platform = new THREE.Mesh(new THREE.CylinderGeometry(4.55,4.65,.24,80), new THREE.MeshStandardMaterial({color:0x4e6566,roughness:.9}));
  platform.position.y = -.16;
  platform.receiveShadow = true;
  root.add(platform);

  scene.add(root);
  return {
    selectable,
    dispose() {
      scene.remove(root);
      root.traverse(obj => { if (obj.isMesh) { obj.geometry?.dispose(); if (obj.material !== materials.ground && !Object.values(materials).includes(obj.material)) obj.material?.dispose(); } });
      for (const m of Object.values(materials)) { m.map?.dispose(); m.dispose(); }
    }
  };
}
