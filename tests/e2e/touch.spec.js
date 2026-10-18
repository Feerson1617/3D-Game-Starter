import { test, expect } from '@playwright/test';
import { savedCamera, distance } from './helpers.js';

test('Echte emulierte Touch-Gesten drehen und zoomen die Kamera',async({page,context})=>{
  await page.goto('./');
  await expect(page.locator('#status')).toHaveAttribute('data-ready','true');
  const box=await page.locator('canvas').boundingBox();
  const x=Math.round(box.x+box.width*.5),y=Math.round(box.y+box.height*.5);
  const cdp=await context.newCDPSession(page);
  const touch=async(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y,id])=>({x,y,id}))});
  const before=await savedCamera(page);
  await touch('touchStart',[[x-60,y,1]]);
  for(let i=1;i<=6;i++) await touch('touchMove',[[x-60+i*20,y,1]]);
  await touch('touchEnd',[]);
  const rotated=await savedCamera(page);
  expect(Math.hypot(rotated.x-before.x,rotated.z-before.z)).toBeGreaterThan(.1);
  await touch('touchStart',[[x-30,y,1],[x+30,y,2]]);
  for(let i=1;i<=5;i++) await touch('touchMove',[[x-30-i*8,y,1],[x+30+i*8,y,2]]);
  await touch('touchEnd',[]);
  const zoomed=await savedCamera(page);
  expect(distance(zoomed)).toBeLessThan(distance(rotated)-.1);
  await cdp.detach();
});
