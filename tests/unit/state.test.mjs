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
