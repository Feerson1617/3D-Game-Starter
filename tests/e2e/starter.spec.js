import { test, expect } from '@playwright/test';

test('3D-Vorschau startet und Spielstand funktioniert',async ({page})=>{
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
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

test('Kamera ist mit Zeiger bedienbar und auf Touchgroesse sichtbar',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#status')).toHaveAttribute('data-ready','true');
  const box=await page.locator('#canvas-host canvas').boundingBox();
  expect(box?.width).toBeGreaterThan(180);
  await page.mouse.move(box.x+box.width*.35,box.y+box.height*.5);
  await page.mouse.down();
  await page.mouse.move(box.x+box.width*.6,box.y+box.height*.5,{steps:6});
  await page.mouse.up();
  await page.getByRole('button',{name:'Kamera zurücksetzen'}).click();
  await expect(page.locator('#message')).toContainText('zurückgesetzt');
});
