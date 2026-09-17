/**
 * ProceduralTextures — CanvasTexture без файлов (threejs-textures).
 * Color-карты: colorSpace sRGB. Repeat/wrap + anisotropy настроены.
 */
import * as THREE from 'three';

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

function toTexture(c, rx, ry) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 4;
  return t;
}

function noise(x, w, h, count, alpha) {
  for (let i = 0; i < count; i++) {
    const v = 18 + Math.random() * 30;
    x.fillStyle = `rgba(${v | 0},${(v + 4) | 0},${(v + 14) | 0},${alpha})`;
    x.fillRect(Math.random() * w, Math.random() * h, 2, 2);
  }
}

function rivet(x, px, py) {
  x.beginPath();
  x.arc(px, py, 4, 0, Math.PI * 2);
  x.fillStyle = '#20242e';
  x.fill();
  x.beginPath();
  x.arc(px - 1, py - 1, 2, 0, Math.PI * 2);
  x.fillStyle = '#8a93a5';
  x.fill();
}

/** Плиты пола 1м: швы, заклёпки, шум. Тайл 8м (repeat 5 на 40м). */
export function makeFloorTexture() {
  const [c, x] = makeCanvas(512, 512);
  x.fillStyle = '#3a3f4a';
  x.fillRect(0, 0, 512, 512);
  noise(x, 512, 512, 2200, 0.25);
  // Швы плит каждые 64px.
  x.strokeStyle = 'rgba(8,10,16,0.9)';
  x.lineWidth = 3;
  for (let i = 0; i <= 512; i += 64) {
    x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke();
    x.beginPath(); x.moveTo(0, i); x.lineTo(512, i); x.stroke();
  }
  // Светлая кромка шва.
  x.strokeStyle = 'rgba(130,150,180,0.22)';
  x.lineWidth = 1;
  for (let i = 3; i <= 512; i += 64) {
    x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 512); x.stroke();
    x.beginPath(); x.moveTo(0, i); x.lineTo(512, i); x.stroke();
  }
  // Заклёпки по углам плит.
  for (let px = 0; px <= 512; px += 64) {
    for (let py = 0; py <= 512; py += 64) {
      rivet(x, px + 10, py + 10);
    }
  }
  return toTexture(c, 5, 5);
}

/** Панели стен: вертикальные стыки, горизонталь trim-полосы, заклёпки. */
export function makeWallTexture() {
  const [c, x] = makeCanvas(512, 128);
  x.fillStyle = '#6a7080';
  x.fillRect(0, 0, 512, 128);
  noise(x, 512, 128, 700, 0.2);
  // Вертикальные стыки каждые 64px.
  x.strokeStyle = 'rgba(20,24,32,0.85)';
  x.lineWidth = 3;
  for (let i = 0; i <= 512; i += 64) {
    x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 128); x.stroke();
  }
  // Trim-полосы сверху и снизу.
  x.fillStyle = 'rgba(24,28,38,0.9)';
  x.fillRect(0, 0, 512, 10);
  x.fillRect(0, 118, 512, 10);
  x.fillStyle = 'rgba(0,170,255,0.35)';
  x.fillRect(0, 12, 512, 2);
  // Заклёпки.
  for (let i = 32; i < 512; i += 64) {
    rivet(x, i, 24);
    rivet(x, i, 104);
  }
  return toTexture(c, 5, 1);
}

/** Hazard: жёлто-чёрные диагонали для барьеров. */
export function makeHazardTexture() {
  const [c, x] = makeCanvas(128, 128);
  x.fillStyle = '#15151a';
  x.fillRect(0, 0, 128, 128);
  x.fillStyle = '#ffcc33';
  for (let i = -128; i < 256; i += 32) {
    x.beginPath();
    x.moveTo(i, 0);
    x.lineTo(i + 16, 0);
    x.lineTo(i + 16 - 128, 128);
    x.lineTo(i - 128, 128);
    x.closePath();
    x.fill();
  }
  // Потёртости.
  noise(x, 128, 128, 250, 0.3);
  return toTexture(c, 2, 1);
}
