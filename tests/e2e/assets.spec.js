import { test, expect } from '@playwright/test';
import { modelFixture } from '../fixtures/model.mjs';

test('GLB/glTF laden Texturen, PBR und Animation; Ressourcen werden freigegeben',async({page},testInfo)=>{
  test.skip(!!process.env.E2E_BASE_URL, 'Modulprüfung benötigt den lokalen Vite-Server.');
  const fixture=modelFixture();
  await page.route('**/models/audit/**',route=>{
    const name=new URL(route.request().url()).pathname.split('/').pop();
    const body=name==='model.gltf'?JSON.stringify(fixture.document):name==='model.glb'?fixture.glb:name==='model.bin'?fixture.buffer:fixture.png;
    return route.fulfill({body,contentType:name==='model.gltf'?'model/gltf+json':name==='color.png'?'image/png':'application/octet-stream'});
  });
  await page.goto('./');
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const result=await page.evaluate(async()=>{
    const { SceneController }=await import('/src/graphics/SceneController.js');
    const host=document.querySelector('#canvas-host');
    window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:false}));
    host.replaceChildren();
    const scene=new SceneController(host,'low');
    const models=[];
    for(const format of ['gltf','glb']) {
      const model=await scene.addModel(`audit/model.${format}`);
      model.group.position.x=models.length*3;
      model.mixer.setTime(.5);
      const mesh=model.root.children.find(child=>child.isMesh);
      models.push({model,format,pbr:mesh.material.isMeshStandardMaterial,texture:mesh.material.map.image.width,y:mesh.position.y,shadows:mesh.castShadow,roughness:mesh.material.roughness,metalness:mesh.material.metalness});
    }
    scene.renderer.render(scene.scene,scene.camera);
    const output=models.map(({model,...data})=>data);
    const start=models[0].model.mixer.time;
    for(let i=0;i<3;i++) await new Promise(requestAnimationFrame);
    const advanced=models[0].model.mixer.time>start;
    let rejected=false;
    try{await scene.addModel('../outside.glb');}catch{rejected=true;}
    window.auditScene=scene;window.auditModels=models;
    return {output,triangles:scene.renderer.info.render.triangles,advanced,rejected,dpr:scene.renderer.getPixelRatio(),shadows:scene.renderer.shadowMap.enabled};
  });
  expect(result.triangles).toBeGreaterThan(0);
  expect(result.advanced).toBe(true);expect(result.rejected).toBe(true);
  expect(result.dpr).toBeLessThanOrEqual(1);expect(result.shadows).toBe(false);
  for(const model of result.output) {
    expect(model.pbr).toBe(true);expect(model.texture).toBe(1);expect(model.y).toBeCloseTo(.5);expect(model.shadows).toBe(true);
    expect(model.roughness).toBe(.6);expect(model.metalness).toBe(.25);
  }
  await page.locator('#canvas-host').screenshot({path:testInfo.outputPath('models.png')});
  const cleanup=await page.evaluate(()=>{
    const scene=window.auditScene;
    let disposed=0;
    const model=window.auditModels[0].model;
    model.root.children.find(c=>c.isMesh).geometry.addEventListener('dispose',()=>disposed++);
    scene.removeModel(model);scene.removeModel(model);
    scene.dispose();
    return {disposed,remaining:scene.models.size,canvas:!!document.querySelector('#canvas-host canvas')};
  });
  expect(cleanup).toEqual({disposed:1,remaining:0,canvas:false});
  expect(errors).toEqual([]);
});
