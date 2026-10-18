import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { QUALITY, DEFAULTS } from '../core/settings.js';
import { createWorld } from './world.js';

export class SceneController {
  constructor(host, quality = 'medium', onSelect = () => {}) {
    this.host=host;
    this.onSelect=onSelect;
    this.quality=quality;
    this.scene=new THREE.Scene();
    this.scene.background = new THREE.Color(0x93b6c5);
    this.scene.fog = new THREE.FogExp2(0x93b6c5, .018);
    this.camera=new THREE.PerspectiveCamera(48,1,.1,150);
    this.renderer=new THREE.WebGLRenderer({ antialias: QUALITY[quality].antialias, powerPreference: quality === 'low' ? 'low-power' : 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.17;
    this.renderer.setClearColor(0x93b6c5);
    host.append(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = .08;
    this.controls.enablePan = false;
    this.controls.minDistance = 3.2;
    this.controls.maxDistance = 32;
    this.controls.maxPolarAngle = Math.PI*.49;
    this.controls.target.set(0,.8,0);
    this.scene.add(new THREE.HemisphereLight(0xe3f2ff,0x6c6253, 2.1));
    const sun = new THREE.DirectionalLight(0xffefdb,3.6);
    sun.position.set(-7,13,6);
    sun.castShadow=true;
    sun.shadow.camera.left = -12; sun.shadow.camera.right=12;
    sun.shadow.camera.top=12; sun.shadow.camera.bottom=-12;
    sun.shadow.camera.near=.2; sun.shadow.camera.far=45;
    sun.shadow.normalBias=.025;
    this.scene.add(sun);
    this.sun=sun;
    this.world=createWorld(this.scene);
    this.models=new Set();
    this.raycaster=new THREE.Raycaster();
    this.pointer=new THREE.Vector2();
    this.isRunning=true;
    this.pointers=new Map();
    this.gesture=false;
    this.onDown=(ev)=>{
      if (ev.button !== 0) return;
      if (this.pointers.size === 0) this.gesture=false;
      this.pointers.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
      if (this.pointers.size > 1) this.gesture=true;
    };
    this.onUp=(ev)=>{
      const start=this.pointers.get(ev.pointerId);
      this.pointers.delete(ev.pointerId);
      if (!start || this.gesture || Math.hypot(ev.clientX-start.x,ev.clientY-start.y)>7) return;
      const rect=this.renderer.domElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      this.pointer.set((ev.clientX-rect.left)/rect.width*2-1,-(ev.clientY-rect.top)/rect.height*2+1);
      this.raycaster.setFromCamera(this.pointer,this.camera);
      const hits=this.raycaster.intersectObjects(Object.values(this.world.selectable),false);
      if (hits[0]?.object.userData.selectable) this.onSelect(hits[0].object.userData.selectable);
    };
    this.onCancel=(ev)=>{this.pointers.delete(ev.pointerId);this.gesture=true;};
    this.renderer.domElement.addEventListener('pointerdown',this.onDown);
    this.renderer.domElement.addEventListener('pointerup',this.onUp);
    this.renderer.domElement.addEventListener('pointercancel',this.onCancel);
    this.onContextLost=()=>{
      this.contextLost=true;
      cancelAnimationFrame(this.frameHandle);
      this.host.dispatchEvent(new CustomEvent('graphics-state',{detail:'lost'}));
    };
    this.onContextRestored=()=>{
      this.contextLost=false;
      this.previous=performance.now();
      this.resize();
      this.host.dispatchEvent(new CustomEvent('graphics-state',{detail:'ready'}));
      this.schedule();
    };
    this.renderer.domElement.addEventListener('webglcontextlost',this.onContextLost);
    this.renderer.domElement.addEventListener('webglcontextrestored',this.onContextRestored);
    this.onVisibility=()=>{
      cancelAnimationFrame(this.frameHandle);
      this.previous=performance.now();
      this.schedule();
    };
    document.addEventListener('visibilitychange',this.onVisibility);
    this.resizeObserver=new ResizeObserver(()=>this.resize());
    this.resizeObserver.observe(host);
    this.setQuality(quality);
    this.setCamera(DEFAULTS.camera);
    this.resize();
    this.previous=performance.now();
    this.frame=(now)=>{
      if(!this.isRunning || document.hidden || this.contextLost) return;
      const dt=Math.min(Math.max((now-this.previous)/1000,0),.1);
      this.previous=now;
      try {
        this.models.forEach(model=>model.update(dt));
        this.controls.update(dt);
        this.renderer.render(this.scene,this.camera);
        this.schedule();
      } catch(error) {
        this.isRunning=false;
        this.host.dispatchEvent(new CustomEvent('graphics-state',{detail:'error'}));
        console.error('3D-Darstellung fehlgeschlagen:',error);
      }
    };
    this.schedule();
  }
  schedule(){ if(this.isRunning && !document.hidden && !this.contextLost) this.frameHandle=requestAnimationFrame(this.frame); }
  async addModel(filename, options={}) {
    const [{loadGLTF},{ModelInstance}]=await Promise.all([import('./assets.js'),import('./ModelInstance.js')]);
    const gltf=await loadGLTF(filename,options);
    const model=new ModelInstance(gltf,this.scene,options);
    if (!this.isRunning) { model.dispose(); throw new Error('Die 3D-Szene ist nicht mehr verfügbar.'); }
    this.models.add(model);
    return model;
  }
  removeModel(model){ this.models.delete(model); model.dispose(); }
  setQuality(name) {
    const preset=QUALITY[name] || QUALITY.medium;
    this.quality = Object.hasOwn(QUALITY,name) ? name : 'medium';
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, preset.pixelRatioCap));
    this.renderer.shadowMap.enabled=preset.shadowSize>0;
    this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    this.sun.shadow.mapSize.set(Math.max(1,preset.shadowSize),Math.max(1,preset.shadowSize));
    if(this.sun.shadow.map) { this.sun.shadow.map.dispose(); this.sun.shadow.map=null; }
    this.sun.castShadow=preset.shadowSize>0;
    this.sun.shadow.needsUpdate=true;
    this.resize();
  }
  resize() {
    const {width,height}=this.host.getBoundingClientRect();
    if(width<=0 || height<=0) return;
    this.camera.aspect=width/height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width,height,false);
  }
  focusObject(key) {
    const object=this.world.selectable[key];
    if(!object) return;
    // Keep the whole sample scene visible; selected object is highlighted temporarily.
    this.controls.target.lerp(object.position,.7);
    this.controls.update();
  }
  getCamera() {
    return { x:this.camera.position.x,y:this.camera.position.y,z:this.camera.position.z,target:this.controls.target.toArray() };
  }
  setCamera({x,y,z,target}) {
    // Flush OrbitControls' pending damping before restoring an exact saved pose.
    const damping=this.controls.enableDamping;
    this.controls.enableDamping=false;
    this.controls.update();
    this.camera.position.set(x,y,z);
    this.controls.target.fromArray(target);
    this.controls.update();
    this.controls.enableDamping=damping;
  }
  resetCamera(){ this.setCamera(DEFAULTS.camera); }
  dispose(){
    this.isRunning=false;
    cancelAnimationFrame(this.frameHandle);
    this.resizeObserver.disconnect();
    this.renderer.domElement.removeEventListener('pointerdown',this.onDown);
    this.renderer.domElement.removeEventListener('pointerup',this.onUp);
    this.renderer.domElement.removeEventListener('pointercancel',this.onCancel);
    this.renderer.domElement.removeEventListener('webglcontextlost',this.onContextLost);
    this.renderer.domElement.removeEventListener('webglcontextrestored',this.onContextRestored);
    document.removeEventListener('visibilitychange',this.onVisibility);
    this.models.forEach(model=>model.dispose());
    this.models.clear();
    this.controls.dispose();
    this.world.dispose();
    this.sun.shadow.map?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
