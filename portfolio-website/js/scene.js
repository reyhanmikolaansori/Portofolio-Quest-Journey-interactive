// Background scene: a looping photo sequence drawn on a canvas,
// plus the compass at the top of the HUD.

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const FRAME_COUNT = 16;
const FRAME_FPS = 2;
const frameSrc = i => `assets/frames/${String(i + 1).padStart(2, "0")}.webp`;

// On tall (phone) screens the photo doesn't fill the screen, so it is drawn
// smaller and the space around it gets a dark textured backdrop.
const PORTRAIT_VIEW = 0.82; // share of the photo's width kept visible
const HUD_GAP = 18;         // space between the health bars and the photo

let W = 0, H = 0;
let hudBottom = 0;
let lastSceneBottom = -1;
let grainPattern = null;

const frames = [];
let framesReady = false;

for (let i = 0; i < FRAME_COUNT; i++) {
  const img = new Image();
  img.onload = () => {
    frames[i] = img;
    framesReady = frames.filter(Boolean).length === FRAME_COUNT;
  };
  img.src = frameSrc(i);
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  measureHud();
}

function measureHud() {
  const player = document.querySelector(".player");
  hudBottom = player ? player.getBoundingClientRect().bottom + HUD_GAP : 0;
}

// Small noise texture used for the phone backdrop
const grain = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 140;
  const g = c.getContext("2d");
  const data = g.createImageData(140, 140);
  for (let i = 0; i < data.data.length; i += 4) {
    const v = 80 + Math.random() * 130;
    data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
    data.data[i + 3] = Math.random() * 26;
  }
  g.putImageData(data, 0, 0);
  return c;
})();

const embers = Array.from({ length: 36 }, () => ({
  x: Math.random(),
  speed: 0.04 + Math.random() * 0.08,
  offset: Math.random(),
  size: 0.8 + Math.random() * 1.6,
  sway: Math.random() * Math.PI * 2,
}));

function drawDivider(y) {
  const line = ctx.createLinearGradient(W * 0.08, 0, W * 0.92, 0);
  line.addColorStop(0, "rgba(179,154,107,0)");
  line.addColorStop(0.5, "rgba(179,154,107,.75)");
  line.addColorStop(1, "rgba(179,154,107,0)");
  ctx.fillStyle = line;
  ctx.fillRect(W * 0.08, y, W * 0.84, 1);

  ctx.save();
  ctx.translate(W / 2, y + 0.5);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = "#b39a6b";
  ctx.fillRect(-3.5, -3.5, 7, 7);
  ctx.fillStyle = "#1a1815";
  ctx.fillRect(-1.5, -1.5, 3, 3);
  ctx.restore();
}

function drawEmbers(t, top) {
  const range = H - top;
  if (range < 40) return;
  embers.forEach(e => {
    const progress = (t * e.speed + e.offset) % 1;
    const x = e.x * W + Math.sin(t * 0.8 + e.sway) * 12;
    const y = H - progress * range;
    const alpha = Math.sin(progress * Math.PI) * (0.55 + 0.45 * Math.sin(t * 6 + e.sway * 3));

    ctx.fillStyle = `rgba(235,140,60,${(alpha * 0.18).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(x, y, e.size * 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,190,110,${(alpha * 0.85).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(x, y, e.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawScene(t) {
  // hard cuts between photos, like stop motion
  const img = frames[Math.floor(t * FRAME_FPS) % FRAME_COUNT];
  const cover = Math.max(W / img.width, H / img.height);

  if (W >= H * 1.2) {
    const w = img.width * cover, h = img.height * cover;
    ctx.drawImage(img, (W - w) / 2, (H - h) * 0.35, w, h);
    return;
  }

  // phone layout: textured backdrop
  const bg = ctx.createRadialGradient(W / 2, H * 0.45, 0, W / 2, H * 0.45, Math.max(W, H) * 0.75);
  bg.addColorStop(0, "#2a2621");
  bg.addColorStop(1, "#0b0a09");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  if (!grainPattern) grainPattern = ctx.createPattern(grain, "repeat");
  ctx.fillStyle = grainPattern;
  ctx.fillRect(0, 0, W, H);

  // photo, zoomed until its top edge sits just under the health bars
  const baseScale = Math.min(W / (img.width * PORTRAIT_VIEW), cover);
  const baseH = img.height * baseScale;
  const centerY = (H - baseH) * 0.42 + baseH / 2;
  const scale = Math.min(cover, Math.max(baseScale, 2 * (centerY - hudBottom) / img.height));
  const w = img.width * scale, h = img.height * scale;
  const x = (W - w) / 2, y = centerY - h / 2;
  ctx.drawImage(img, x, y, w, h);

  // the quest tracker sits in the empty space below the photo
  const sceneBottom = Math.round(y + h);
  if (sceneBottom !== lastSceneBottom) {
    lastSceneBottom = sceneBottom;
    document.documentElement.style.setProperty("--scene-bottom", sceneBottom + "px");
  }

  // fade the photo's edges into the backdrop
  const fade = h * 0.1;
  let edge = ctx.createLinearGradient(0, y, 0, y + fade);
  edge.addColorStop(0, "rgba(20,18,16,.75)");
  edge.addColorStop(1, "rgba(20,18,16,0)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, y, W, fade);
  edge = ctx.createLinearGradient(0, y + h - fade, 0, y + h);
  edge.addColorStop(0, "rgba(20,18,16,0)");
  edge.addColorStop(1, "rgba(20,18,16,.75)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, y + h - fade, W, fade);

  drawDivider(y - 9);
  drawDivider(y + h + 8);
  drawEmbers(t, y + h + 22);
}

function drawVignette() {
  const v = ctx.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.3, W / 2, H * 0.55, Math.max(W, H) * 0.8);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(5,7,12,.45)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

function loop(now) {
  if (framesReady) {
    drawScene(now / 1000);
    drawVignette();
  }
  requestAnimationFrame(loop);
}

window.addEventListener("resize", resize);
if (document.fonts) document.fonts.ready.then(measureHud);
resize();
requestAnimationFrame(loop);


// ---- Compass ----

const compass = document.getElementById("compass");
const compassScale = compass.querySelector(".compass-scale");
const heading = Math.floor(Math.random() * 360); // random direction on each visit
const DIRECTIONS = { 0: "N", 90: "E", 180: "S", 270: "W" };

function buildCompass() {
  const width = compass.clientWidth;
  const pxPerDegree = width / 180; // shows 180° at a time
  compassScale.innerHTML = "";

  for (let d = Math.ceil((heading - 90) / 15) * 15; d <= heading + 90; d += 15) {
    const deg = ((d % 360) + 360) % 360;
    const mark = document.createElement("span");
    if (DIRECTIONS[deg]) {
      mark.className = "c-label c-major";
      mark.textContent = DIRECTIONS[deg];
    } else {
      mark.className = "c-tick";
    }
    mark.style.left = width / 2 + (d - heading) * pxPerDegree + "px";
    compassScale.appendChild(mark);
  }

  // quest marker, opens the projects window
  const marker = document.createElement("button");
  marker.type = "button";
  marker.className = "c-quest";
  marker.setAttribute("aria-label", "Open quests");
  marker.style.left = width / 2 - 45 * pxPerDegree + "px";
  marker.addEventListener("click", e => {
    e.stopPropagation();
    openMenu("projects");
  });
  compassScale.appendChild(marker);
}

window.addEventListener("resize", buildCompass);
buildCompass();
