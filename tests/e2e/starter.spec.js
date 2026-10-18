import { test, expect } from '@playwright/test';
import { savedCamera, distance } from './helpers.js';

test('3D-Vorschau startet und Spielstand funktioniert',async ({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('./');
  await expect(page.locator('#status')).toHaveAttribute('data-ready','true');
  await expect(page.locator('#canvas-host canvas')).toBeVisible();
  await page.locator('#quality').selectOption('low');
  await page.locator('#object').selectOption('ceramic');
  await page.getByRole('button',{name:'Speichern'}).click();
  await expect(page.locator('#message')).toContainText('gespeichert');
  await page.reload();
  await expect(page.locator('#status')).toHaveAttribute('data-ready','true');
  await page.getByRole('button',{name:'Laden',exact:true}).click();
  await expect(page.locator('#quality')).toHaveValue('low');
  await expect(page.locator('#object')).toHaveValue('ceramic');
  expect(errors).toEqual([]);
});

test('Kamera reagiert auf Drehen, Zoom und exaktes Zurücksetzen',async({page,browserName},testInfo)=>{
  await page.goto('./');
  await expect(page.locator('#status')).toHaveAttribute('data-ready','true');
  const box=await page.locator('#canvas-host canvas').boundingBox();
  expect(box?.width).toBeGreaterThan(180);
  const before=await savedCamera(page);
  await page.mouse.move(box.x+box.width*.35,box.y+box.height*.5);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width*.6,box.y+box.height*.5,{steps:6});
  await page.mouse.up();
  const after=await savedCamera(page);
  expect(Math.hypot(after.x-before.x,after.z-before.z)).toBeGreaterThan(.1);
  if(browserName==='chromium') {
    await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);
    await page.mouse.wheel(0,-250);
    await expect.poll(async()=>distance(await savedCamera(page))).toBeLessThan(distance(before)-.1);
  }
  await page.getByRole('button',{name:'Kamera zurücksetzen'}).click();
  await expect(page.locator('#message')).toContainText('zurückgesetzt');
  const reset=await savedCamera(page);
  expect(reset.x).toBeCloseTo(8.5,5);
  expect(reset.y).toBeCloseTo(6.2,5);
  expect(reset.z).toBeCloseTo(10.5,5);
  await page.locator('#canvas-host').screenshot({path:testInfo.outputPath('scene.png')});
});

test('Safari-Seitenwiederkehr erhält die Szene',async({page})=>{
  test.skip(!!process.env.E2E_BASE_URL, 'Lifecycle-Fix wird lokal vor dem Merge geprüft.');
  await page.goto('./');
  await expect(page.locator('#status')).toHaveAttribute('data-ready','true');
  await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true})));
  await expect(page.locator('#canvas-host canvas')).toBeVisible();
});

test('Grafikkontext kann verloren gehen und wiederhergestellt werden',async({page,browserName})=>{
  test.skip(!!process.env.E2E_BASE_URL || browserName!=='chromium','Gezielte lokale Chromium-Kontextprüfung.');
  await page.goto('./');
  await expect(page.locator('#status')).toHaveAttribute('data-ready','true');
  const supported=await page.evaluate(()=>{
    window.auditContext=document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context');
    if(!window.auditContext) return false;
    window.auditContext.loseContext();return true;
  });
  test.skip(!supported,'WEBGL_lose_context ist in dieser Umgebung nicht vorhanden.');
  await expect(page.locator('#status')).toHaveAttribute('data-ready','false');
  await page.evaluate(()=>window.auditContext.restoreContext());
  await expect(page.locator('#status')).toHaveAttribute('data-ready','true');
  await expect(page.locator('canvas')).toBeVisible();
});
