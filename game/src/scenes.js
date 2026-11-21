// The six hand-designed scenes of Twin Tides.
// Each scene draws two near-identical pictures on a 640x480 canvas: the left
// panel with no differences applied, the right panel with every difference
// applied. A difference is a small branch inside the draw function, so both
// panels always agree except for exactly the listed differences. Decorative
// scatter (stars, bubbles, snowflakes) comes from a seeded PRNG, so every
// render is byte-identical for the same scene.

import { mulberry32, seededRange } from './prng.js';

export const SCENE_WIDTH = 640;
export const SCENE_HEIGHT = 480;

function skyGradient(ctx, top, middle, bottom) {
  const gradient = ctx.createLinearGradient(0, 0, 0, SCENE_HEIGHT);
  gradient.addColorStop(0, top);
  gradient.addColorStop(0.55, middle);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SCENE_WIDTH, SCENE_HEIGHT);
}

function drawCloud(ctx, x, y, scale, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 22 * scale, 0, Math.PI * 2);
  ctx.arc(x + 22 * scale, y + 4 * scale, 18 * scale, 0, Math.PI * 2);
  ctx.arc(x - 22 * scale, y + 6 * scale, 16 * scale, 0, Math.PI * 2);
  ctx.arc(x + 4 * scale, y - 12 * scale, 17 * scale, 0, Math.PI * 2);
  ctx.fill();
}

function drawGull(ctx, x, y, scale, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 12 * scale, y);
  ctx.quadraticCurveTo(x - 5 * scale, y - 9 * scale, x, y);
  ctx.quadraticCurveTo(x + 5 * scale, y - 9 * scale, x + 12 * scale, y);
  ctx.stroke();
}

function drawStar(ctx, x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    const outerX = x + Math.cos(angle) * radius;
    const outerY = y + Math.sin(angle) * radius;
    const innerAngle = angle + Math.PI / 5;
    const innerX = x + Math.cos(innerAngle) * radius * 0.45;
    const innerY = y + Math.sin(innerAngle) * radius * 0.45;
    if (i === 0) ctx.moveTo(outerX, outerY);
    else ctx.lineTo(outerX, outerY);
    ctx.lineTo(innerX, innerY);
  }
  ctx.closePath();
  ctx.fill();
}

function drawFish(ctx, x, y, scale, bodyColor, flip) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.scale(scale, scale);
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-22, 0);
  ctx.lineTo(-36, -11);
  ctx.lineTo(-36, 11);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(13, -3, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1b2a3a';
  ctx.beginPath();
  ctx.arc(14, -3, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPine(ctx, x, baseY, height, color) {
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(x - 4, baseY - 14, 8, 14);
  ctx.fillStyle = color;
  for (let i = 0; i < 3; i += 1) {
    const tierY = baseY - 10 - i * (height / 3.4);
    const tierWidth = 44 - i * 11;
    ctx.beginPath();
    ctx.moveTo(x, tierY - height / 3.2);
    ctx.lineTo(x - tierWidth / 2, tierY);
    ctx.lineTo(x + tierWidth / 2, tierY);
    ctx.closePath();
    ctx.fill();
  }
}

function drawBubble(ctx, x, y, radius) {
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath();
  ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Scene 1 — Harbour at Dawn
// ---------------------------------------------------------------------------

function drawHarbour(ctx, changed) {
  skyGradient(ctx, '#ffe3ae', '#ffab7a', '#e87e6d');
  // Sun
  ctx.fillStyle = '#fff3c4';
  ctx.beginPath();
  ctx.arc(520, 90, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffb703';
  ctx.beginPath();
  ctx.arc(520, 90, 30, 0, Math.PI * 2);
  ctx.fill();
  if (changed.has('sun-face')) {
    ctx.fillStyle = '#7a4a00';
    ctx.beginPath();
    ctx.arc(510, 84, 3.5, 0, Math.PI * 2);
    ctx.arc(530, 84, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7a4a00';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(520, 94, 10, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
  drawCloud(ctx, 150, 70, 1, 'rgba(255,244,230,0.95)');
  drawCloud(ctx, 330, 55, 0.8, 'rgba(255,244,230,0.9)');
  if (changed.has('cloud-extra')) drawCloud(ctx, 430, 130, 0.7, 'rgba(255,244,230,0.9)');
  drawGull(ctx, 250, 110, 1, '#5a3a28');
  drawGull(ctx, 300, 140, 0.8, '#5a3a28');
  drawGull(ctx, 380, 95, 0.9, '#5a3a28');
  if (changed.has('extra-gull')) drawGull(ctx, 200, 120, 1, '#5a3a28');
  // Sea
  const sea = ctx.createLinearGradient(0, 300, 0, 480);
  sea.addColorStop(0, '#3d8fa3');
  sea.addColorStop(1, '#1d5f7a');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 300, 640, 180);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(20 + i * 100, 330 + (i % 3) * 42);
    ctx.quadraticCurveTo(50 + i * 100, 322 + (i % 3) * 42, 80 + i * 100, 330 + (i % 3) * 42);
    ctx.stroke();
  }
  // Sun reflection
  ctx.fillStyle = 'rgba(255,220,120,0.5)';
  for (let i = 0; i < 5; i += 1) {
    ctx.fillRect(500 - i * 8, 312 + i * 34, 40 + i * 16, 5);
  }
  // Lighthouse
  ctx.fillStyle = '#f7f3e8';
  ctx.beginPath();
  ctx.moveTo(70, 300);
  ctx.lineTo(78, 130);
  ctx.lineTo(102, 130);
  ctx.lineTo(110, 300);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d64541';
  ctx.fillRect(74, 168, 32, 22);
  if (!changed.has('stripe-missing')) ctx.fillRect(72, 232, 36, 22);
  ctx.fillStyle = '#2f3e46';
  ctx.fillRect(72, 118, 36, 14);
  ctx.fillStyle = '#ffd54a';
  ctx.beginPath();
  ctx.arc(90, 112, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2f3e46';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(90, 112);
  ctx.lineTo(90, 84);
  ctx.stroke();
  ctx.fillStyle = '#d64541';
  ctx.beginPath();
  ctx.moveTo(90, 84);
  if (changed.has('flag-left')) {
    ctx.lineTo(66, 90);
    ctx.lineTo(90, 97);
  } else {
    ctx.lineTo(114, 90);
    ctx.lineTo(90, 97);
  }
  ctx.closePath();
  ctx.fill();
  // Light beam
  ctx.fillStyle = 'rgba(255,240,150,0.25)';
  ctx.beginPath();
  ctx.moveTo(99, 112);
  ctx.lineTo(300, 60);
  ctx.lineTo(300, 150);
  ctx.closePath();
  ctx.fill();
  // Pier
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(200, 330, 360, 12);
  ctx.fillStyle = '#a9743f';
  for (let x = 210; x < 560; x += 28) ctx.fillRect(x, 330, 20, 12);
  ctx.fillStyle = '#6b4226';
  for (const px of [230, 330, 430, 530]) ctx.fillRect(px, 342, 10, 34);
  // Sailboat with red (or teal) sail
  ctx.fillStyle = '#5b3a1e';
  ctx.beginPath();
  ctx.moveTo(272, 268);
  ctx.lineTo(330, 268);
  ctx.lineTo(318, 284);
  ctx.lineTo(284, 284);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3a2412';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(301, 268);
  ctx.lineTo(301, 196);
  ctx.stroke();
  ctx.fillStyle = changed.has('sail-teal') ? '#1f9e8e' : '#d64541';
  ctx.beginPath();
  ctx.moveTo(301, 200);
  ctx.lineTo(301, 264);
  ctx.lineTo(336, 264);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f7f3e8';
  ctx.beginPath();
  ctx.moveTo(297, 206);
  ctx.lineTo(297, 264);
  ctx.lineTo(272, 264);
  ctx.closePath();
  ctx.fill();
  // Rowboat
  ctx.fillStyle = '#2e7d5b';
  ctx.beginPath();
  ctx.moveTo(430, 356);
  ctx.lineTo(486, 356);
  ctx.lineTo(476, 372);
  ctx.lineTo(440, 372);
  ctx.closePath();
  ctx.fill();
  // Buoys
  for (const bx of [180, 380]) {
    ctx.fillStyle = '#ff7f2a';
    ctx.beginPath();
    ctx.arc(bx, 420, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(bx - 10, 416, 20, 5);
  }
  if (changed.has('buoy-extra')) {
    ctx.fillStyle = '#ff7f2a';
    ctx.beginPath();
    ctx.arc(560, 420, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(550, 416, 20, 5);
  }
  // Fisherman on the pier
  ctx.fillStyle = '#3a6ea5';
  ctx.fillRect(472, 296, 16, 34);
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(480, 288, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = changed.has('hat-purple') ? '#7b5ea7' : '#ffd54a';
  ctx.beginPath();
  ctx.arc(480, 284, 10, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(470, 282, 20, 3);
  ctx.strokeStyle = '#3a2412';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(488, 302);
  ctx.quadraticCurveTo(520, 320, 540, 352);
  ctx.stroke();
}

const harbourDifferences = [
  { id: 'sun-face', x: 520, y: 90, r: 40, label: 'the sun grew a smile' },
  { id: 'extra-gull', x: 200, y: 120, r: 22, label: 'an extra gull' },
  { id: 'sail-teal', x: 306, y: 232, r: 34, label: 'the sail changed colour' },
  { id: 'stripe-missing', x: 90, y: 243, r: 30, label: 'a lighthouse stripe vanished' },
  { id: 'buoy-extra', x: 560, y: 420, r: 18, label: 'an extra buoy' },
  { id: 'hat-purple', x: 480, y: 288, r: 20, label: "the fisherman's hat changed colour" },
  { id: 'cloud-extra', x: 430, y: 130, r: 30, label: 'an extra cloud' },
  { id: 'flag-left', x: 92, y: 90, r: 22, label: 'the flag flipped direction' },
];

// ---------------------------------------------------------------------------
// Scene 2 — Coral Garden
// ---------------------------------------------------------------------------

function drawCoralGarden(ctx, changed) {
  skyGradient(ctx, '#0e5f7d', '#17809e', '#0a4a63');
  // Light rays
  ctx.fillStyle = 'rgba(255,255,220,0.10)';
  for (const [rx, rw] of [[80, 60], [260, 44], [460, 70]]) {
    ctx.beginPath();
    ctx.moveTo(rx, 0);
    ctx.lineTo(rx + rw, 0);
    ctx.lineTo(rx + rw + 60, 400);
    ctx.lineTo(rx + 60, 400);
    ctx.closePath();
    ctx.fill();
  }
  const rng = mulberry32(20261121);
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  for (let i = 0; i < 24; i += 1) {
    ctx.beginPath();
    ctx.arc(seededRange(rng, 10, 630), seededRange(rng, 10, 380), seededRange(rng, 1, 2.4), 0, Math.PI * 2);
    ctx.fill();
  }
  // Sandy floor
  ctx.fillStyle = '#e8d29a';
  ctx.beginPath();
  ctx.moveTo(0, 410);
  ctx.quadraticCurveTo(160, 392, 320, 408);
  ctx.quadraticCurveTo(480, 424, 640, 402);
  ctx.lineTo(640, 480);
  ctx.lineTo(0, 480);
  ctx.closePath();
  ctx.fill();
  // Seaweed
  ctx.strokeStyle = '#2e8b57';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  const weedHeight = changed.has('seaweed-tall') ? 130 : 84;
  ctx.beginPath();
  ctx.moveTo(580, 410);
  ctx.quadraticCurveTo(566, 360, 580, 410 - weedHeight);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(600, 412);
  ctx.quadraticCurveTo(612, 372, 598, 336);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(60, 414);
  ctx.quadraticCurveTo(48, 372, 62, 338);
  ctx.stroke();
  // Corals
  ctx.strokeStyle = changed.has('coral-orange') ? '#ff8c42' : '#ff6b9d';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  for (const [bx, tipX, tipY] of [[120, 96, 300], [120, 140, 312], [120, 104, 330]]) {
    ctx.beginPath();
    ctx.moveTo(bx, 408);
    ctx.quadraticCurveTo(bx + (tipX - bx) / 2, 360, tipX, tipY);
    ctx.stroke();
  }
  ctx.fillStyle = '#ff9e2c';
  ctx.beginPath();
  ctx.arc(500, 380, 34, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#ff7f2a';
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.arc(472 + i * 14, 372 - Math.abs(i - 2) * 8, 9, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#9b7ede';
  ctx.beginPath();
  ctx.arc(320, 396, 18, 0, Math.PI * 2);
  ctx.arc(338, 388, 13, 0, Math.PI * 2);
  ctx.arc(304, 390, 12, 0, Math.PI * 2);
  ctx.fill();
  // Anemone + clownfish
  ctx.strokeStyle = '#ff8c69';
  ctx.lineWidth = 4;
  for (let i = 0; i < 7; i += 1) {
    const ax = 168 + i * 7;
    ctx.beginPath();
    ctx.moveTo(ax, 428);
    ctx.quadraticCurveTo(ax + 6, 408, ax + 2, 396);
    ctx.stroke();
  }
  if (!changed.has('clownfish-gone')) {
    drawFish(ctx, 205, 400, 0.55, '#ff7f2a', false);
    ctx.fillStyle = '#fff';
    ctx.fillRect(196, 394, 4, 12);
  }
  // Fish
  drawFish(ctx, 200, 180, 1, '#ffd54a', false);
  drawFish(ctx, 350, 140, 1.1, changed.has('fish-green') ? '#4caf50' : '#4aa8dd', true);
  drawFish(ctx, 480, 220, 0.9, '#ff8c42', false);
  drawFish(ctx, 430, 90, 0.6, '#ffd54a', true);
  drawFish(ctx, 460, 108, 0.6, '#ffd54a', true);
  // Turtle
  ctx.fillStyle = '#3e8e5a';
  ctx.beginPath();
  ctx.ellipse(300, 300, 52, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2c6e44';
  ctx.beginPath();
  ctx.ellipse(300, 300, 40, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2c6e44';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(300, 282);
  ctx.lineTo(300, 318);
  ctx.moveTo(272, 300);
  ctx.lineTo(328, 300);
  ctx.stroke();
  ctx.fillStyle = '#3e8e5a';
  ctx.beginPath();
  ctx.arc(352, 292, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1b2a3a';
  if (changed.has('turtle-eye-closed')) {
    ctx.strokeStyle = '#1b2a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(350, 288);
    ctx.lineTo(358, 288);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(354, 288, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#3e8e5a';
  ctx.beginPath();
  ctx.ellipse(252, 308, 16, 7, 0.5, 0, Math.PI * 2);
  ctx.ellipse(252, 292, 16, 7, -0.5, 0, Math.PI * 2);
  ctx.fill();
  // Starfish (5 arms, or 4 when changed)
  ctx.fillStyle = '#ff9e7d';
  const arms = changed.has('starfish-four') ? 4 : 5;
  ctx.save();
  ctx.translate(420, 440);
  ctx.beginPath();
  for (let i = 0; i < arms; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / arms;
    const outerX = Math.cos(angle) * 24;
    const outerY = Math.sin(angle) * 24;
    const innerAngle = angle + Math.PI / arms;
    const innerX = Math.cos(innerAngle) * 10;
    const innerY = Math.sin(innerAngle) * 10;
    if (i === 0) ctx.moveTo(outerX, outerY);
    else ctx.lineTo(outerX, outerY);
    ctx.lineTo(innerX, innerY);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Shell on the sand
  if (!changed.has('shell-gone')) {
    ctx.fillStyle = '#f7e8d0';
    ctx.beginPath();
    ctx.arc(250, 448, 14, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#d9b48a';
    ctx.lineWidth = 1.5;
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.moveTo(250, 448);
      ctx.lineTo(250 + i * 6, 436);
      ctx.stroke();
    }
  }
  // Crab
  if (changed.has('crab-appears')) {
    ctx.fillStyle = '#e2574c';
    ctx.beginPath();
    ctx.ellipse(150, 452, 18, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1b2a3a';
    ctx.beginPath();
    ctx.arc(142, 446, 2.5, 0, Math.PI * 2);
    ctx.arc(158, 446, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e2574c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(136, 448);
    ctx.lineTo(122, 438);
    ctx.moveTo(164, 448);
    ctx.lineTo(178, 438);
    ctx.stroke();
  }
  // Bubbles
  drawBubble(ctx, 540, 300, 7);
  drawBubble(ctx, 556, 260, 5);
  drawBubble(ctx, 530, 220, 9);
  drawBubble(ctx, 250, 200, 6);
  drawBubble(ctx, 262, 160, 4);
  if (changed.has('bubbles-extra')) {
    drawBubble(ctx, 520, 120, 8);
    drawBubble(ctx, 540, 92, 6);
    drawBubble(ctx, 502, 88, 5);
  }
}

const coralDifferences = [
  { id: 'fish-green', x: 350, y: 140, r: 34, label: 'a fish changed colour' },
  { id: 'turtle-eye-closed', x: 352, y: 290, r: 24, label: "the turtle's eye closed" },
  { id: 'starfish-four', x: 420, y: 440, r: 28, label: 'the starfish lost an arm' },
  { id: 'bubbles-extra', x: 522, y: 104, r: 30, label: 'extra bubbles appeared' },
  { id: 'coral-orange', x: 120, y: 350, r: 36, label: 'the coral changed colour' },
  { id: 'shell-gone', x: 250, y: 444, r: 20, label: 'a shell vanished' },
  { id: 'seaweed-tall', x: 580, y: 350, r: 30, label: 'a seaweed grew taller' },
  { id: 'crab-appears', x: 150, y: 450, r: 24, label: 'a crab appeared' },
  { id: 'clownfish-gone', x: 198, y: 402, r: 22, label: 'the clownfish swam away' },
];

// ---------------------------------------------------------------------------
// Scene 3 — Night Market
// ---------------------------------------------------------------------------

function drawLantern(ctx, x, y, scale, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = '#3a2412';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -26);
  ctx.lineTo(0, -18);
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fillRect(-4, -20, 8, 40);
  ctx.fillStyle = '#ffd54a';
  ctx.fillRect(-8, -28, 16, 6);
  ctx.fillRect(-8, 22, 16, 6);
  ctx.restore();
}

function drawMarketStall(ctx, x, y, width, awningColor, signText, stripes = true) {
  ctx.fillStyle = '#7a4a21';
  ctx.fillRect(x, y + 60, width, 90);
  ctx.fillStyle = '#5d3717';
  ctx.fillRect(x, y + 60, width, 8);
  ctx.fillStyle = awningColor;
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 62);
  ctx.lineTo(x + width + 10, y + 62);
  ctx.lineTo(x + width - 6, y + 18);
  ctx.lineTo(x + 6, y + 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  if (stripes) {
    for (let i = 0; i < 4; i += 1) {
      ctx.fillRect(x + 8 + i * (width / 4), y + 22, width / 8, 38);
    }
  }
  ctx.fillStyle = '#fdf6d8';
  ctx.fillRect(x + 10, y + 84, width - 20, 34);
  ctx.fillStyle = '#333';
  ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(signText, x + width / 2, y + 108);
}

function drawNightMarket(ctx, changed) {
  skyGradient(ctx, '#141b3d', '#232a5e', '#3d2a6e');
  const rng = mulberry32(777);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  for (let i = 0; i < 40; i += 1) {
    ctx.beginPath();
    ctx.arc(seededRange(rng, 10, 630), seededRange(rng, 8, 190), seededRange(rng, 1, 2.2), 0, Math.PI * 2);
    ctx.fill();
  }
  // Moon
  ctx.fillStyle = '#fdf6d8';
  ctx.beginPath();
  ctx.arc(540, 70, 32, 0, Math.PI * 2);
  ctx.fill();
  if (changed.has('moon-crescent')) {
    ctx.fillStyle = '#232a5e';
    ctx.beginPath();
    ctx.arc(552, 64, 28, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#e8ddb0';
  ctx.beginPath();
  ctx.arc(530, 62, 5, 0, Math.PI * 2);
  ctx.arc(548, 80, 4, 0, Math.PI * 2);
  ctx.fill();
  // String lights
  ctx.strokeStyle = '#2f2a1e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 30);
  ctx.quadraticCurveTo(320, 90, 640, 26);
  ctx.stroke();
  for (let i = 0; i < 9; i += 1) {
    const lx = 30 + i * 68;
    const ly = 30 + Math.sin((i / 8) * Math.PI) * 34;
    const isOut = changed.has('bulb-out') && i === 5;
    ctx.fillStyle = isOut ? '#4a4a4a' : ['#ff5a5a', '#ffd54a', '#7ee081', '#6db3ff'][i % 4];
    ctx.beginPath();
    ctx.arc(lx, ly + 8, 7, 0, Math.PI * 2);
    ctx.fill();
    if (!isOut) {
      ctx.fillStyle = 'rgba(255,230,120,0.25)';
      ctx.beginPath();
      ctx.arc(lx, ly + 8, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Ground
  ctx.fillStyle = '#4a3423';
  ctx.fillRect(0, 400, 640, 80);
  ctx.fillStyle = '#5d4229';
  ctx.fillRect(0, 400, 640, 8);
  // Stalls
  drawMarketStall(ctx, 40, 190, 160, '#d64541', changed.has('sign-changed') ? '面' : '饺');
  drawMarketStall(ctx, 240, 190, 160, '#2e7d5b', '灯', !changed.has('awning-plain'));
  drawMarketStall(ctx, 440, 190, 160, '#3a6ea5', '茶');
  // Awning stripes on the middle stall (present unless changed)
  // Dumplings on the left stall counter
  ctx.fillStyle = '#fdf6d8';
  for (const [dx, dy] of [[90, 268], [110, 268], [100, 252]]) {
    ctx.beginPath();
    ctx.arc(dx, dy, 11, 0, Math.PI * 2);
    ctx.fill();
  }
  if (changed.has('dumpling-extra')) {
    ctx.beginPath();
    ctx.arc(130, 268, 11, 0, Math.PI * 2);
    ctx.fill();
  }
  // Steaming pots on the right stall
  ctx.fillStyle = '#8a8f98';
  ctx.fillRect(480, 258, 44, 22);
  ctx.fillRect(540, 258, 44, 22);
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(500, 256);
  ctx.quadraticCurveTo(496, 238, 504, 226);
  ctx.moveTo(562, 256);
  ctx.quadraticCurveTo(566, 238, 558, 226);
  ctx.stroke();
  // Lanterns
  drawLantern(ctx, 200, 150, 1, changed.has('lantern-green') ? '#4caf50' : '#e5484d');
  drawLantern(ctx, 420, 140, 0.9, '#e5484d');
  drawLantern(ctx, 600, 160, 1.1, '#ff9e2c');
  drawLantern(ctx, 60, 130, 0.8, '#ff9e2c');
  // Cat on the middle stall roof
  if (!changed.has('cat-gone')) {
    ctx.fillStyle = '#2b2b2b';
    ctx.beginPath();
    ctx.ellipse(320, 196, 26, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(340, 188, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(334, 180);
    ctx.lineTo(336, 172);
    ctx.lineTo(340, 180);
    ctx.moveTo(344, 180);
    ctx.lineTo(346, 172);
    ctx.lineTo(348, 180);
    ctx.fill();
    ctx.fillStyle = '#ffd54a';
    ctx.beginPath();
    ctx.arc(343, 187, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  // Vendor with hat at the right stall
  ctx.fillStyle = '#c65d3b';
  ctx.fillRect(500, 300, 22, 60);
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(511, 290, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = changed.has('hat-green') ? '#4caf50' : '#ffd54a';
  ctx.beginPath();
  ctx.moveTo(494, 288);
  ctx.lineTo(528, 288);
  ctx.lineTo(511, 268);
  ctx.closePath();
  ctx.fill();
  // Banner between stalls
  if (!changed.has('banner-gone')) {
    ctx.fillStyle = '#e5484d';
    ctx.fillRect(380, 200, 120, 30);
    ctx.fillStyle = '#ffd54a';
    ctx.font = 'bold 16px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★ 夜市 ★', 440, 221);
  }
  // Bunting flags
  for (let i = 0; i < 12; i += 1) {
    ctx.fillStyle = ['#ff5a5a', '#ffd54a', '#7ee081', '#6db3ff'][i % 4];
    ctx.beginPath();
    ctx.moveTo(20 + i * 52, 360);
    ctx.lineTo(44 + i * 52, 360);
    ctx.lineTo(32 + i * 52, 382);
    ctx.closePath();
    ctx.fill();
  }
}

const marketDifferences = [
  { id: 'lantern-green', x: 200, y: 150, r: 26, label: 'a lantern changed colour' },
  { id: 'awning-plain', x: 320, y: 230, r: 34, label: 'the awning lost its stripes' },
  { id: 'cat-gone', x: 326, y: 188, r: 28, label: 'the cat vanished from the roof' },
  { id: 'moon-crescent', x: 540, y: 70, r: 34, label: 'the moon became a crescent' },
  { id: 'sign-changed', x: 120, y: 232, r: 26, label: 'a stall sign changed' },
  { id: 'dumpling-extra', x: 130, y: 268, r: 20, label: 'an extra dumpling appeared' },
  { id: 'bulb-out', x: 370, y: 66, r: 18, label: 'a string-light bulb went out' },
  { id: 'banner-gone', x: 440, y: 215, r: 30, label: 'the banner disappeared' },
  { id: 'hat-green', x: 511, y: 282, r: 24, label: "the vendor's hat changed colour" },
];

// ---------------------------------------------------------------------------
// Scene 4 — Mountain Cabin
// ---------------------------------------------------------------------------

function drawMountainCabin(ctx, changed) {
  skyGradient(ctx, '#a8c8e8', '#d6e9f8', '#f4f8ff');
  const rng = mulberry32(4242);
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  for (let i = 0; i < 30; i += 1) {
    ctx.beginPath();
    ctx.arc(seededRange(rng, 10, 630), seededRange(rng, 8, 150), seededRange(rng, 1.5, 3), 0, Math.PI * 2);
    ctx.fill();
  }
  if (changed.has('star-extra')) drawStar(ctx, 100, 60, 10, '#ffd54a');
  // Mountains
  ctx.fillStyle = '#7a93b8';
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.lineTo(140, 120);
  ctx.lineTo(280, 300);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#93a9c9';
  ctx.beginPath();
  ctx.moveTo(220, 300);
  ctx.lineTo(420, 90);
  ctx.lineTo(620, 300);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(140, 120);
  ctx.lineTo(110, 165);
  ctx.lineTo(140, 152);
  ctx.lineTo(170, 165);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(420, 90);
  ctx.lineTo(384, 140);
  ctx.lineTo(420, 126);
  ctx.lineTo(456, 140);
  ctx.closePath();
  ctx.fill();
  // Snow ground
  ctx.fillStyle = '#f4f8ff';
  ctx.fillRect(0, 300, 640, 180);
  ctx.fillStyle = '#e3eefb';
  ctx.beginPath();
  ctx.ellipse(320, 320, 300, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  // Frozen pond
  ctx.fillStyle = '#a8d0e8';
  ctx.beginPath();
  ctx.ellipse(420, 430, 110, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(420, 430, 84, 18, 0, 0, Math.PI * 2);
  ctx.stroke();
  if (changed.has('skater-appears')) {
    ctx.fillStyle = '#d64541';
    ctx.beginPath();
    ctx.arc(420, 412, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(414, 420, 12, 16);
    ctx.strokeStyle = '#3a2412';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(414, 436);
    ctx.lineTo(404, 442);
    ctx.moveTo(426, 436);
    ctx.lineTo(436, 442);
    ctx.stroke();
  }
  // Cabin
  ctx.fillStyle = '#8a5a33';
  ctx.fillRect(220, 250, 130, 90);
  ctx.fillStyle = '#6b4226';
  for (let y = 258; y < 340; y += 14) ctx.fillRect(220, y, 130, 3);
  ctx.fillStyle = '#5d3a1e';
  ctx.beginPath();
  ctx.moveTo(200, 252);
  ctx.lineTo(285, 190);
  ctx.lineTo(370, 252);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(200, 252);
  ctx.lineTo(285, 190);
  ctx.lineTo(370, 252);
  ctx.lineTo(356, 252);
  ctx.lineTo(285, 204);
  ctx.lineTo(214, 252);
  ctx.closePath();
  ctx.fill();
  // Icicle on the roof
  if (changed.has('icicle-appears')) {
    ctx.fillStyle = '#bfe3f5';
    ctx.beginPath();
    ctx.moveTo(330, 240);
    ctx.lineTo(340, 240);
    ctx.lineTo(335, 268);
    ctx.closePath();
    ctx.fill();
  }
  // Chimney + smoke
  ctx.fillStyle = '#9a8a7a';
  ctx.fillRect(318, 196, 22, 44);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  const drift = changed.has('smoke-left') ? -1 : 1;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(329 + drift * i * 12, 184 - i * 16, 9 + i * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  // Door and window
  ctx.fillStyle = '#4a2f1d';
  ctx.fillRect(268, 292, 30, 48);
  ctx.fillStyle = '#ffd54a';
  ctx.beginPath();
  ctx.arc(292, 318, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = changed.has('window-dark') ? '#2f3e46' : '#ffd54a';
  ctx.fillRect(316, 268, 24, 24);
  ctx.strokeStyle = '#4a2f1d';
  ctx.lineWidth = 2;
  ctx.strokeRect(316, 268, 24, 24);
  ctx.beginPath();
  ctx.moveTo(328, 268);
  ctx.lineTo(328, 292);
  ctx.moveTo(316, 280);
  ctx.lineTo(340, 280);
  ctx.stroke();
  // Pines
  drawPine(ctx, 60, 340, 90, '#2e6b4f');
  drawPine(ctx, 120, 350, 70, '#357a5a');
  drawPine(ctx, 560, 345, 95, '#2e6b4f');
  drawPine(ctx, 600, 355, 70, '#357a5a');
  if (changed.has('pine-extra')) drawPine(ctx, 500, 350, 60, '#2e6b4f');
  // Deer
  ctx.fillStyle = '#9a6b4f';
  ctx.beginPath();
  ctx.ellipse(180, 380, 26, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(202, 362, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a4f35';
  ctx.fillRect(160, 390, 5, 22);
  ctx.fillRect(172, 390, 5, 22);
  ctx.fillRect(188, 390, 5, 22);
  if (!changed.has('antlers-gone')) {
    ctx.strokeStyle = '#6b4226';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(198, 354);
    ctx.lineTo(190, 336);
    ctx.moveTo(190, 342);
    ctx.lineTo(182, 340);
    ctx.moveTo(206, 354);
    ctx.lineTo(214, 336);
    ctx.moveTo(214, 342);
    ctx.lineTo(222, 340);
    ctx.stroke();
  }
  // Snowman
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(500, 400, 26, 0, Math.PI * 2);
  ctx.arc(500, 362, 20, 0, Math.PI * 2);
  ctx.arc(500, 332, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1b2a3a';
  ctx.beginPath();
  ctx.arc(494, 328, 2.5, 0, Math.PI * 2);
  ctx.arc(506, 328, 2.5, 0, Math.PI * 2);
  ctx.arc(500, 368, 2.5, 0, Math.PI * 2);
  ctx.arc(500, 380, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = changed.has('carrot-purple') ? '#9b7ede' : '#ff7f2a';
  ctx.beginPath();
  ctx.moveTo(500, 332);
  ctx.lineTo(522, 336);
  ctx.lineTo(500, 339);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#d64541';
  ctx.fillRect(486, 314, 28, 6);
  ctx.fillRect(490, 300, 20, 16);
  ctx.strokeStyle = '#6b4226';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(482, 360);
  ctx.lineTo(462, 344);
  ctx.moveTo(518, 360);
  ctx.lineTo(538, 344);
  ctx.stroke();
}

const cabinDifferences = [
  { id: 'smoke-left', x: 300, y: 150, r: 32, label: 'the chimney smoke drifted the other way' },
  { id: 'carrot-purple', x: 510, y: 334, r: 22, label: "the snowman's nose changed colour" },
  { id: 'antlers-gone', x: 202, y: 344, r: 28, label: "the deer's antlers vanished" },
  { id: 'window-dark', x: 328, y: 280, r: 26, label: 'the cabin window went dark' },
  { id: 'pine-extra', x: 500, y: 320, r: 28, label: 'an extra pine tree appeared' },
  { id: 'skater-appears', x: 420, y: 424, r: 24, label: 'a skater appeared on the pond' },
  { id: 'star-extra', x: 100, y: 60, r: 20, label: 'an extra star appeared' },
  { id: 'icicle-appears', x: 335, y: 252, r: 20, label: 'an icicle appeared on the roof' },
];

// ---------------------------------------------------------------------------
// Scene 5 — Orbital Garden
// ---------------------------------------------------------------------------

function drawOrbitalGarden(ctx, changed) {
  ctx.fillStyle = '#0a0e27';
  ctx.fillRect(0, 0, 640, 480);
  const rng = mulberry32(90210);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  for (let i = 0; i < 70; i += 1) {
    ctx.beginPath();
    ctx.arc(seededRange(rng, 6, 634), seededRange(rng, 6, 474), seededRange(rng, 0.8, 2.2), 0, Math.PI * 2);
    ctx.fill();
  }
  // Planet in the window
  ctx.fillStyle = '#2f6db3';
  ctx.beginPath();
  ctx.arc(520, 100, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4caf50';
  ctx.beginPath();
  ctx.arc(508, 90, 12, 0, Math.PI * 2);
  ctx.arc(534, 110, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.beginPath();
  ctx.ellipse(520, 82, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  if (changed.has('planet-ring')) {
    ctx.strokeStyle = '#ffd54a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(520, 100, 62, 14, -0.35, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Window frame
  ctx.strokeStyle = '#8a8f98';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(520, 100, 56, 0, Math.PI * 2);
  ctx.stroke();
  // Greenhouse dome
  ctx.fillStyle = 'rgba(120,200,255,0.18)';
  ctx.beginPath();
  ctx.arc(320, 400, 170, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#c8d4e0';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(320, 400, 170, Math.PI, 0);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(320, 230);
  ctx.lineTo(320, 400);
  ctx.moveTo(196, 310);
  ctx.lineTo(444, 310);
  ctx.stroke();
  // Grow lights
  for (const lx of [250, 320, 390]) {
    const isOff = changed.has('light-off') && lx === 320;
    ctx.fillStyle = isOff ? '#4a4a4a' : '#ff5a8a';
    ctx.beginPath();
    ctx.arc(lx, 262, 10, 0, Math.PI * 2);
    ctx.fill();
    if (!isOff) {
      ctx.fillStyle = 'rgba(255,90,138,0.2)';
      ctx.beginPath();
      ctx.moveTo(lx - 8, 270);
      ctx.lineTo(lx + 8, 270);
      ctx.lineTo(lx + 30, 360);
      ctx.lineTo(lx - 30, 360);
      ctx.closePath();
      ctx.fill();
    }
  }
  // Plant beds
  ctx.fillStyle = '#3a2a1e';
  ctx.fillRect(210, 360, 220, 40);
  ctx.fillStyle = '#5d4229';
  ctx.fillRect(210, 360, 220, 8);
  // Tomato plants
  for (const px of [250, 320, 390]) {
    ctx.strokeStyle = '#2e8b57';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(px, 360);
    ctx.quadraticCurveTo(px - 8, 330, px, 306);
    ctx.stroke();
    ctx.fillStyle = '#3e8e5a';
    ctx.beginPath();
    ctx.ellipse(px - 14, 326, 14, 8, -0.5, 0, Math.PI * 2);
    ctx.ellipse(px + 14, 336, 14, 8, 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = changed.has('tomato-purple') && px === 320 ? '#9b7ede' : '#e5484d';
    ctx.beginPath();
    ctx.arc(px, 306, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px - 10, 344, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  // Flowers
  ctx.fillStyle = '#ffd54a';
  for (const [fx, fy] of [[230, 380], [410, 382]]) {
    for (let p = 0; p < 5; p += 1) {
      const angle = (p / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(fx + Math.cos(angle) * 7, fy + Math.sin(angle) * 7, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#e5484d';
    ctx.beginPath();
    ctx.arc(fx, fy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd54a';
  }
  if (changed.has('flower-extra')) {
    ctx.fillStyle = '#ffd54a';
    for (let p = 0; p < 5; p += 1) {
      const angle = (p / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(320 + Math.cos(angle) * 7, 384 + Math.sin(angle) * 7, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#e5484d';
    ctx.beginPath();
    ctx.arc(320, 384, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  // Astronaut
  ctx.fillStyle = '#f2f2f2';
  ctx.beginPath();
  ctx.ellipse(140, 250, 26, 34, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#dfe6ee';
  ctx.beginPath();
  ctx.arc(140, 208, 20, 0, Math.PI * 2);
  ctx.fill();
  if (changed.has('visor-up')) {
    ctx.fillStyle = '#8ecae6';
    ctx.beginPath();
    ctx.arc(140, 208, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2c89b';
    ctx.beginPath();
    ctx.arc(140, 210, 8, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#1d3557';
    ctx.beginPath();
    ctx.arc(140, 208, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(134, 202, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = changed.has('patch-circle') ? '#ffd54a' : '#e5484d';
  if (changed.has('patch-circle')) {
    ctx.beginPath();
    ctx.arc(152, 244, 6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    drawStar(ctx, 152, 244, 7, '#e5484d');
  }
  ctx.strokeStyle = '#f2f2f2';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(120, 260);
  ctx.lineTo(96, 282);
  ctx.moveTo(160, 260);
  ctx.lineTo(186, 282);
  ctx.stroke();
  // Robot arm
  ctx.strokeStyle = '#c8ccd4';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  const armAngle = changed.has('arm-moved') ? -0.9 : -0.4;
  const armX = 200 + Math.cos(armAngle) * 70;
  const armY = 380 + Math.sin(armAngle) * 70;
  ctx.beginPath();
  ctx.moveTo(200, 380);
  ctx.lineTo(armX, armY);
  ctx.stroke();
  ctx.fillStyle = '#8a8f98';
  ctx.beginPath();
  ctx.arc(200, 380, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd54a';
  ctx.beginPath();
  ctx.arc(armX, armY, 8, 0, Math.PI * 2);
  ctx.fill();
  // Floating wrench
  if (changed.has('wrench-appears')) {
    ctx.strokeStyle = '#c8ccd4';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(420, 140);
    ctx.lineTo(448, 122);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(452, 120, 8, 0.5, Math.PI * 1.7);
    ctx.stroke();
  }
  // Control panel
  ctx.fillStyle = '#2f3e46';
  ctx.fillRect(480, 380, 110, 60);
  ctx.fillStyle = '#4caf50';
  ctx.beginPath();
  ctx.arc(500, 400, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e5484d';
  ctx.beginPath();
  ctx.arc(524, 400, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd54a';
  ctx.fillRect(546, 394, 26, 12);
}

const orbitalDifferences = [
  { id: 'tomato-purple', x: 320, y: 306, r: 22, label: 'a tomato turned purple' },
  { id: 'patch-circle', x: 152, y: 244, r: 18, label: "the astronaut's patch changed shape" },
  { id: 'planet-ring', x: 520, y: 100, r: 46, label: 'the planet grew a ring' },
  { id: 'wrench-appears', x: 434, y: 130, r: 24, label: 'a wrench floated into view' },
  { id: 'flower-extra', x: 320, y: 384, r: 20, label: 'an extra flower bloomed' },
  { id: 'arm-moved', x: 176, y: 352, r: 30, label: 'the robot arm moved' },
  { id: 'light-off', x: 320, y: 262, r: 20, label: 'a grow light went out' },
  { id: 'visor-up', x: 140, y: 208, r: 24, label: "the astronaut lifted the visor" },
];

// ---------------------------------------------------------------------------
// Scene 6 — Clockwork Library
// ---------------------------------------------------------------------------

function drawBookshelf(ctx, x, y, width, height, palette) {
  ctx.fillStyle = '#6b4226';
  ctx.fillRect(x, y, width, height);
  for (let shelf = 0; shelf < 3; shelf += 1) {
    const shelfY = y + 12 + shelf * 44;
    ctx.fillStyle = '#5d3717';
    ctx.fillRect(x, shelfY + 30, width, 6);
    let bookX = x + 6;
    let colorIndex = shelf * 3;
    while (bookX < x + width - 14) {
      const bookWidth = 10 + ((colorIndex * 7) % 8);
      ctx.fillStyle = palette[colorIndex % palette.length];
      ctx.fillRect(bookX, shelfY, bookWidth, 30);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(bookX, shelfY + 4, bookWidth, 3);
      bookX += bookWidth + 2;
      colorIndex += 1;
    }
  }
}

function drawGear(ctx, x, y, radius, teeth, rotation, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < teeth; i += 1) {
    const angle = (i / teeth) * Math.PI * 2;
    const nextAngle = ((i + 0.5) / teeth) * Math.PI * 2;
    ctx.lineTo(Math.cos(angle) * radius * 1.25, Math.sin(angle) * radius * 1.25);
    ctx.lineTo(Math.cos(nextAngle) * radius * 1.25, Math.sin(nextAngle) * radius * 1.25);
    ctx.lineTo(Math.cos(nextAngle + 0.15) * radius * 0.9, Math.sin(nextAngle + 0.15) * radius * 0.9);
  }
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.55, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2f3e46';
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawClockworkLibrary(ctx, changed) {
  skyGradient(ctx, '#3d2a1e', '#5d4229', '#2b1d12');
  // Wall panels
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(0, 0, 640, 40);
  // Bookshelves
  drawBookshelf(ctx, 24, 120, 180, 260, ['#a63d40', '#3a6ea5', '#2e7d5b', '#c98a2c', '#7b5ea7']);
  drawBookshelf(ctx, 436, 120, 180, 260, ['#2e7d5b', '#c98a2c', '#a63d40', '#7b5ea7', '#3a6ea5']);
  // Big clock
  ctx.fillStyle = '#f7f3e8';
  ctx.beginPath();
  ctx.arc(320, 90, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c98a2c';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(320, 90, 52, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#2f3e46';
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(320 + Math.sin(angle) * 42, 90 - Math.cos(angle) * 42, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  const hourAngle = changed.has('clock-time') ? 2.6 : 5.2;
  const minuteAngle = changed.has('clock-time') ? 0.4 : 1.9;
  ctx.strokeStyle = '#2f3e46';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(320, 90);
  ctx.lineTo(320 + Math.sin(hourAngle) * 24, 90 - Math.cos(hourAngle) * 24);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(320, 90);
  ctx.lineTo(320 + Math.sin(minuteAngle) * 38, 90 - Math.cos(minuteAngle) * 38);
  ctx.stroke();
  // Gears
  drawGear(ctx, 480, 150, 30, 8, 0.3, '#c98a2c');
  drawGear(ctx, 540, 190, 20, 6, changed.has('gear-turned') ? 1.1 : 0.6, '#a87c2a');
  drawGear(ctx, 90, 420, 26, 8, 0.9, '#a87c2a');
  // Rug
  ctx.fillStyle = '#a63d40';
  ctx.fillRect(220, 400, 200, 56);
  ctx.fillStyle = '#e8c87a';
  ctx.fillRect(220, 400, 200, 8);
  ctx.fillRect(220, 448, 200, 8);
  if (!changed.has('rug-stripe-gone')) {
    ctx.fillRect(308, 408, 24, 40);
  }
  ctx.strokeStyle = '#7a2e30';
  ctx.lineWidth = 2;
  ctx.strokeRect(232, 414, 176, 34);
  // Ladder
  ctx.strokeStyle = '#8a5a33';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(120, 380);
  ctx.lineTo(120, 180);
  ctx.moveTo(152, 380);
  ctx.lineTo(152, 180);
  ctx.stroke();
  ctx.lineWidth = 4;
  for (let i = 0; i < 5; i += 1) {
    if (changed.has('rung-missing') && i === 2) continue;
    const rungY = 210 + i * 38;
    ctx.beginPath();
    ctx.moveTo(120, rungY);
    ctx.lineTo(152, rungY);
    ctx.stroke();
  }
  // Brass owl on the left shelf top
  ctx.fillStyle = '#c98a2c';
  ctx.beginPath();
  ctx.ellipse(114, 108, 24, 28, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(100, 84, 8, 0, Math.PI * 2);
  ctx.arc(128, 84, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#a87c2a';
  ctx.beginPath();
  ctx.moveTo(98, 76);
  ctx.lineTo(102, 66);
  ctx.lineTo(106, 76);
  ctx.moveTo(124, 76);
  ctx.lineTo(128, 66);
  ctx.lineTo(132, 76);
  ctx.fill();
  if (changed.has('owl-eyes-closed')) {
    ctx.strokeStyle = '#2f3e46';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(95, 84);
    ctx.lineTo(105, 84);
    ctx.moveTo(123, 84);
    ctx.lineTo(133, 84);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#2f3e46';
    ctx.beginPath();
    ctx.arc(100, 84, 3.5, 0, Math.PI * 2);
    ctx.arc(128, 84, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(101, 83, 1.2, 0, Math.PI * 2);
    ctx.arc(129, 83, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#e8a83c';
  ctx.beginPath();
  ctx.moveTo(110, 92);
  ctx.lineTo(118, 92);
  ctx.lineTo(114, 98);
  ctx.closePath();
  ctx.fill();
  // Stack of books with a sleeping cat
  ctx.fillStyle = '#3a6ea5';
  ctx.fillRect(180, 372, 90, 14);
  ctx.fillStyle = '#a63d40';
  ctx.fillRect(186, 358, 78, 14);
  ctx.fillStyle = '#2e7d5b';
  ctx.fillRect(192, 344, 66, 14);
  ctx.fillStyle = '#e8a83c';
  ctx.beginPath();
  ctx.ellipse(225, 336, 30, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(250, 330, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(244, 324);
  ctx.lineTo(246, 316);
  ctx.lineTo(250, 324);
  ctx.moveTo(252, 324);
  ctx.lineTo(254, 316);
  ctx.lineTo(258, 324);
  ctx.fill();
  if (changed.has('cat-tail-up')) {
    ctx.strokeStyle = '#e8a83c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(198, 334);
    ctx.quadraticCurveTo(188, 316, 196, 304);
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#e8a83c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(198, 334);
    ctx.quadraticCurveTo(186, 342, 178, 338);
    ctx.stroke();
  }
  // Candles on the right desk
  ctx.fillStyle = '#5d3717';
  ctx.fillRect(470, 360, 120, 14);
  ctx.fillStyle = '#fdf6d8';
  ctx.fillRect(500, 330, 10, 30);
  ctx.fillRect(556, 330, 10, 30);
  if (!changed.has('flame-out')) {
    ctx.fillStyle = '#ff9e2c';
    ctx.beginPath();
    ctx.ellipse(505, 322, 5, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd54a';
    ctx.beginPath();
    ctx.ellipse(505, 324, 2.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ff9e2c';
  ctx.beginPath();
  ctx.ellipse(561, 322, 5, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd54a';
  ctx.beginPath();
  ctx.ellipse(561, 324, 2.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Chandelier
  ctx.strokeStyle = '#8a8f98';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(560, 40);
  ctx.lineTo(560, 70);
  ctx.stroke();
  ctx.fillStyle = '#c98a2c';
  ctx.beginPath();
  ctx.arc(560, 78, 12, 0, Math.PI * 2);
  ctx.fill();
  const bulbOut = changed.has('bulb-out-library');
  ctx.fillStyle = bulbOut ? '#4a4a4a' : '#fff3c4';
  ctx.beginPath();
  ctx.arc(560, 82, 6, 0, Math.PI * 2);
  ctx.fill();
  if (!bulbOut) {
    ctx.fillStyle = 'rgba(255,240,150,0.25)';
    ctx.beginPath();
    ctx.arc(560, 82, 16, 0, Math.PI * 2);
    ctx.fill();
  }
  // One book spine changes colour on the right shelf
  ctx.fillStyle = changed.has('book-blue') ? '#3a6ea5' : '#a63d40';
  ctx.fillRect(560, 132, 12, 30);
}

const libraryDifferences = [
  { id: 'gear-turned', x: 540, y: 190, r: 26, label: 'a gear turned' },
  { id: 'owl-eyes-closed', x: 114, y: 84, r: 26, label: "the brass owl closed its eyes" },
  { id: 'book-blue', x: 566, y: 147, r: 20, label: 'a book spine changed colour' },
  { id: 'flame-out', x: 505, y: 322, r: 18, label: 'a candle flame went out' },
  { id: 'clock-time', x: 320, y: 90, r: 52, label: 'the clock shows a different time' },
  { id: 'rug-stripe-gone', x: 320, y: 428, r: 30, label: 'a rug stripe disappeared' },
  { id: 'rung-missing', x: 136, y: 286, r: 20, label: 'a ladder rung vanished' },
  { id: 'cat-tail-up', x: 196, y: 322, r: 24, label: "the cat's tail lifted" },
  { id: 'bulb-out-library', x: 560, y: 82, r: 20, label: 'the chandelier bulb went out' },
];

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const SCENES = [
  {
    id: 'harbour',
    name: 'Harbour at Dawn',
    subtitle: 'Lighthouse, fishing boats and gulls at first light',
    timeLimit: 120,
    seed: 101,
    draw: drawHarbour,
    differences: harbourDifferences,
  },
  {
    id: 'coral',
    name: 'Coral Garden',
    subtitle: 'A reef full of fish, a turtle and one shy crab',
    timeLimit: 120,
    seed: 202,
    draw: drawCoralGarden,
    differences: coralDifferences,
  },
  {
    id: 'market',
    name: 'Night Market',
    subtitle: 'Paper lanterns, dumplings and a cat on the roof',
    timeLimit: 110,
    seed: 303,
    draw: drawNightMarket,
    differences: marketDifferences,
  },
  {
    id: 'cabin',
    name: 'Mountain Cabin',
    subtitle: 'Snow, pines, a frozen pond and a patient deer',
    timeLimit: 100,
    seed: 404,
    draw: drawMountainCabin,
    differences: cabinDifferences,
  },
  {
    id: 'orbital',
    name: 'Orbital Garden',
    subtitle: 'A greenhouse in space, growing tomatoes by starlight',
    timeLimit: 100,
    seed: 505,
    draw: drawOrbitalGarden,
    differences: orbitalDifferences,
  },
  {
    id: 'library',
    name: 'Clockwork Library',
    subtitle: 'Gears, books and a brass owl that never sleeps',
    timeLimit: 90,
    seed: 606,
    draw: drawClockworkLibrary,
    differences: libraryDifferences,
  },
];

export function renderScenePanels(scene, leftCtx, rightCtx) {
  const changed = new Set(scene.differences.map((d) => d.id));
  scene.draw(leftCtx, new Set());
  scene.draw(rightCtx, changed);
}
