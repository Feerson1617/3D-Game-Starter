import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS,validateState } from '../../src/core/settings.js';
import { saveState,loadState,resetState } from '../../src/core/storage.js';
function fakeStorage(){ const map=new Map();return {setItem:(k,v)=>map.set(k,v),getItem:(k)=>map.get(k)??null,removeItem:(k)=>map.delete(k)}; }
test('Fehlerhafte Eingaben werden sicher begrenzt',()=>{
  assert.deepEqual(validateState({quality:'ultra',object:'__proto__',camera:{x:Infinity,y:0,z:1,target:[0,0,0]}}),DEFAULTS);
});
test('Gueltige Eingaben bleiben erhalten',()=>{
  const s=validateState({quality:'high',object:'wood',camera:{x:1,y:2,z:3,target:[4,5,6]}});
  assert.equal(s.quality,'high');assert.equal(s.object,'wood');assert.deepEqual(s.camera.target,[4,5,6]);
});
test('Einstellungen lokal speichern, laden und loeschen',()=>{
  const storage=fakeStorage();
  assert.equal(loadState(storage),null);
  assert.equal(saveState({quality:'low',object:'ceramic',camera:DEFAULTS.camera},storage),true);
  assert.equal(loadState(storage).object,'ceramic');
  assert.equal(resetState(storage),true);assert.equal(loadState(storage),null);
});
test('Lokaler Speicher darf ausfallen, ohne die Anwendung abzustuerzen',()=>{
  const storage={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}};
  assert.equal(loadState(storage),null);
  assert.equal(saveState(DEFAULTS,storage),false);
  assert.equal(resetState(storage),false);
});
test('Auch der Zugriff auf localStorage selbst darf gesperrt sein',()=>{
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
  try {
    Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw Error('SecurityError');}});
    assert.equal(saveState(DEFAULTS),false);
    assert.equal(loadState(),null);
    assert.equal(resetState(),false);
  } finally {
    if(descriptor) Object.defineProperty(globalThis,'localStorage',descriptor); else delete globalThis.localStorage;
  }
});
test('Repositorys und mehrere PRs teilen keine Spielstände',async()=>{
  const previous=globalThis.location;
  const modules=[];
  const storage=fakeStorage();
  try {
    for(const path of ['/Neues-Spiel/','/Anderes-Spiel/','/Neues-Spiel/pr-preview/pr-1/','/Neues-Spiel/pr-preview/pr-2/','/pr-preview/pr-1/']) {
      globalThis.location={pathname:path};
      modules.push(await import(`../../src/core/storage.js?scope=${encodeURIComponent(path)}`));
    }
    modules[0].saveState({...DEFAULTS,quality:'high'},storage);
    for(const mod of modules.slice(1)) assert.equal(mod.loadState(storage),null);
    modules[2].saveState({...DEFAULTS,quality:'low'},storage);
    assert.equal(modules[0].loadState(storage).quality,'high');
    assert.equal(modules[2].loadState(storage).quality,'low');
    assert.equal(modules[3].loadState(storage),null);
  } finally {
    if(previous===undefined) delete globalThis.location; else globalThis.location=previous;
  }
});
