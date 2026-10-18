import { AnimationMixer, Group } from 'three';

/** Owns one independently loaded glTF. Clones must not share disposable resources. */
export class ModelInstance {
  constructor(gltf, parent, { animation = 0, shadows = true } = {}) {
    this.root = gltf.scene;
    // Keep placement independent of the model's animated root transform.
    this.group = new Group();
    this.group.add(this.root);
    parent.add(this.group);
    this.clips = gltf.animations;
    this.root.traverse(object => {
      if (object.isMesh) object.castShadow = object.receiveShadow = shadows;
    });
    this.mixer = new AnimationMixer(this.root);
    this.play(animation);
  }
  play(index = 0) {
    this.mixer.stopAllAction();
    const clip = typeof index === 'string' ? this.clips.find(c => c.name === index) : this.clips[index];
    if (clip) this.mixer.clipAction(clip).reset().play();
  }
  update(dt) { if (!this.disposed) this.mixer.update(dt); }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.root);
    const geometries = new Set(), materials = new Set(), textures = new Set(), skeletons = new Set();
    this.root.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      if (object.skeleton) skeletons.add(object.skeleton);
      for (const m of object.material ? [object.material].flat() : []) {
        materials.add(m);
        for (const value of Object.values(m)) if (value?.isTexture) textures.add(value);
      }
    });
    const bitmaps = new Set();
    textures.forEach(t => { if (t.source?.data?.close) bitmaps.add(t.source.data); t.dispose(); });
    bitmaps.forEach(b => b.close());
    materials.forEach(m => m.dispose());
    geometries.forEach(g => g.dispose());
    skeletons.forEach(s => s.dispose());
    this.group.removeFromParent();
  }
}
