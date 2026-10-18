export async function savedCamera(page) {
  await page.locator('#save').click();
  return page.evaluate(() => {
    const entry = Object.entries(localStorage).find(([key]) => key.startsWith('3d-game-starter:'));
    return JSON.parse(entry[1]).state.camera;
  });
}
export function distance(camera) {
  return Math.hypot(camera.x-camera.target[0],camera.y-camera.target[1],camera.z-camera.target[2]);
}
