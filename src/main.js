import './style.css';
import { SceneController } from './graphics/SceneController.js';
import { OBJECT_DESCRIPTION } from './graphics/world.js';
import { DEFAULTS, validateState } from './core/settings.js';
import { saveState, loadState, resetState } from './core/storage.js';

const el=(id)=>document.getElementById(id);
const quality=el('quality'), object=el('object'), info=el('object-info');
const message=el('message'), status=el('status');
let scene;
const feedback=(text)=>{message.textContent=text;};

function chooseObject(key) {
  object.value=key;
  info.textContent=OBJECT_DESCRIPTION[key]||'';
  scene?.focusObject(key);
}
function readState(){ return validateState({quality:quality.value,object:object.value,camera:scene.getCamera()}); }
function applyState(data){
  const state=validateState(data);
  quality.value=state.quality;
  scene.setQuality(state.quality);
  object.value=state.object;
  info.textContent=OBJECT_DESCRIPTION[state.object];
  scene.setCamera(state.camera);
}
try {
  // Fast fallbacks are important on older iPads and devices without WebGL.
  const lowPower = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
  const initialQuality = lowPower ? 'low' : 'medium';
  quality.value=initialQuality;
  scene=new SceneController(el('canvas-host'), initialQuality, (key)=>chooseObject(key));
  info.textContent=OBJECT_DESCRIPTION[DEFAULTS.object];
  status.textContent='3D bereit';
  status.dataset.ready='true';
  quality.addEventListener('change',()=>{scene.setQuality(quality.value);feedback('Grafikqualität aktualisiert.');});
  object.addEventListener('change',()=>chooseObject(object.value));
  el('reset-camera').addEventListener('click',()=>{scene.resetCamera();feedback('Kamera zurückgesetzt.');});
  el('save').addEventListener('click',()=>feedback(saveState(readState()) ? 'Einstellungen lokal gespeichert.' : 'Speichern ist in diesem Browser nicht verfügbar.'));
  el('load').addEventListener('click',()=>{const saved=loadState();if(saved){applyState(saved);feedback('Gespeicherte Einstellungen geladen.');}else feedback('Kein gültiger Spielstand gefunden.');});
  el('reset').addEventListener('click',()=>{resetState();applyState(DEFAULTS);feedback('Testzustand zurückgesetzt.');});
  // Safari may preserve this page in its back/forward cache. Keep that renderer alive.
  window.addEventListener('pagehide',(event)=>{if(!event.persisted) scene?.dispose();});
  el('canvas-host').addEventListener('graphics-state',({detail})=>{
    const ready=detail==='ready';
    status.dataset.ready=String(ready);
    status.textContent=ready ? '3D bereit' : detail==='lost' ? 'Grafik wird wiederhergestellt …' : '3D-Fehler';
    feedback(ready ? 'Grafik wiederhergestellt.' : 'Bei anhaltendem Grafikfehler die Seite neu laden oder eine sparsamere Grafikqualität wählen.');
  });
} catch (error) {
  console.error('3D-Initialisierung fehlgeschlagen:', error);
  status.textContent='3D nicht verfügbar';
  el('canvas-host').textContent='Der WebGL-Renderer konnte auf diesem Gerät nicht gestartet werden. Bitte prüfe Browser und Grafikbeschleunigung.';
  feedback('Die Vorschau benötigt WebGL. Andere Projektdateien sind davon nicht betroffen.');
  for(const id of ['quality','object','reset-camera','save','load','reset']) el(id).disabled=true;
}
