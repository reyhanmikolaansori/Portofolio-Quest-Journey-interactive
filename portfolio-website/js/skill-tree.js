// Draws the skill tree from SKILLS as an SVG night sky.
// Desktop shows a few branches at a time, phones show one per screen;
// the sky scrolls sideways (trackpad, swipe, drag or the arrow buttons).

const escapeHtml = text => String(text)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/"/g, "&quot;");

function wrapText(text, maxChars) {
  if (text.length <= maxChars) return [text];
  const lines = [];
  let line = "";
  text.split(" ").forEach(word => {
    if (line && (line + " " + word).length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + " " + word : word;
    }
  });
  if (line) lines.push(line);
  return lines;
}

let treeDrawnOnce = false;

function buildTree() {
  const sky = document.getElementById("sky");
  const panel = sky.parentElement;
  const W = sky.clientWidth, H = sky.clientHeight;
  if (!W || !H) return;

  const branches = SKILLS.children;
  const count = branches.length;
  const isPhone = W < 720;
  const visible = isPhone ? 1 : Math.max(1, Math.min(count, Math.floor(W / 400)));
  const scrollable = visible < count;
  const sidePad = scrollable ? (isPhone ? 24 : 62) : 0; // room for the arrow buttons
  const colW = (W - 2 * sidePad) / visible;
  const step = isPhone ? W : colW;                      // distance between branch columns
  const contentW = isPhone ? count * W : 2 * sidePad + count * colW;

  const trunkY = 130;   // shared line all branches hang from
  const starY = 188;    // branch stars
  const rowGap = isPhone ? 84 : 80;

  const nodes = [];
  let parts = "";
  let maxY = H;

  const firstX = sidePad + colW / 2;
  const lastX = sidePad + (count - 1) * step + colW / 2;
  if (count > 1) parts += line(`M${firstX},${trunkY} L${lastX},${trunkY}`, 0.2);

  branches.forEach((branch, i) => {
    const cx = sidePad + i * step + colW / 2;
    const fontSize = isPhone ? 21 : Math.max(17, Math.min(colW * 0.055, 23));
    const nameLines = wrapText(branch.label, isPhone ? 22 : 18);
    const nameY = starY + 30 + fontSize * 0.5;
    const stemTop = nameY + (nameLines.length - 1) * fontSize * 1.15 + 16;

    parts += line(`M${cx},${trunkY} L${cx},${starY}`, 0.3);

    nodes.push({ ...branch, x: cx, y: starY, r: 11, isBranch: true });
    parts += `
      <g class="node branch" data-index="${nodes.length - 1}" tabindex="0" role="button"
         aria-label="${escapeHtml(branch.label + ": " + branch.info)}" transform="translate(${cx} ${starY})">
        <circle class="halo" r="56"/>
        <path class="spark" d="M-34,0H34M0,-34V34M-14,-14L14,14M-14,14L14,-14"/>
        <circle class="core" r="10"/>
      </g>
      <text class="branch-name" x="${cx}" y="${nameY}" font-size="${fontSize}">
        ${nameLines.map((l, k) => `<tspan x="${cx}" dy="${k ? fontSize * 1.15 : 0}">${escapeHtml(l)}</tspan>`).join("")}
      </text>`;

    branch.children.forEach((skill, j) => {
      const side = j % 2 ? 1 : -1;            // alternate left and right
      const hasLogo = Boolean(skill.logo);
      const r = hasLogo ? 22 : 0;
      const offset = isPhone ? (hasLogo ? 44 : 26) : (hasLogo ? 56 : 34);
      const x = cx + side * offset;
      const y = stemTop + 44 + j * rowGap;

      // each skill branches off the stem that comes down from its star
      parts += line(`M${cx},${stemTop} L${cx},${y - 26} Q${cx},${y} ${x - side * (r + 3)},${y}`, 0.45 + j * 0.12);

      const labelLines = wrapText(skill.label, isPhone ? 12 : (hasLogo ? 14 : 20));
      const labelX = side * (hasLogo ? r + 12 : 6);
      const labelY = -((labelLines.length - 1) * 15) / 2 + 4.5;
      const label = `
        <text class="label" style="text-anchor:${side > 0 ? "start" : "end"}" y="${labelY}">
          ${labelLines.map((l, k) => `<tspan x="${labelX}" dy="${k ? 15 : 0}">${escapeHtml(l)}</tspan>`).join("")}
        </text>`;

      const logoSize = r * 1.36;
      const icon = hasLogo
        ? `<circle class="halo" r="${r * 2.1}"/>
           <circle class="badge" r="${r}"/>
           <image href="${skill.logo}" x="${-logoSize / 2}" y="${-logoSize / 2}" width="${logoSize}" height="${logoSize}"/>`
        : `<rect class="hit-area" x="${side > 0 ? 0 : -170}" y="-16" width="170" height="32"/>`;

      nodes.push({ ...skill, x, y, r });
      parts += `
        <g class="node skill${hasLogo ? "" : " text-only"}" data-index="${nodes.length - 1}" tabindex="0" role="button"
           aria-label="${escapeHtml(skill.label + ": " + skill.info)}" transform="translate(${x} ${y})"
           style="animation-delay:${(0.5 + j * 0.12).toFixed(2)}s">${icon}${label}</g>`;

      maxY = Math.max(maxY, y + 60);
    });
  });

  const contentH = Math.ceil(maxY);

  let stars = "";
  const starCount = Math.round(contentW * contentH / 3200);
  for (let i = 0; i < starCount; i++) {
    stars += `<circle class="sky-dot" cx="${Math.round(Math.random() * contentW)}" cy="${Math.round(Math.random() * contentH)}"
      r="${(0.3 + Math.random() * 1.1).toFixed(2)}" style="animation-delay:${(Math.random() * 4).toFixed(2)}s; animation-duration:${(3 + Math.random() * 4).toFixed(1)}s"/>`;
  }

  const snapPoints = branches.map((_, i) => `<div class="sky-snap" style="left:${i * step}px"></div>`).join("");

  sky.innerHTML = `
    <div class="sky-fog" style="width:${contentW}px; height:${contentH}px"></div>
    <svg viewBox="0 0 ${contentW} ${contentH}" width="${contentW}" height="${contentH}">
      <defs>
        <radialGradient id="glow">
          <stop offset="0" stop-color="#dfe8ff" stop-opacity=".9"/>
          <stop offset=".25" stop-color="#9fb4e6" stop-opacity=".35"/>
          <stop offset="1" stop-color="#9fb4e6" stop-opacity="0"/>
        </radialGradient>
      </defs>
      ${stars}
      ${parts}
    </svg>
    ${snapPoints}
    <div class="tooltip" aria-hidden="true"></div>`;

  // only animate the first time the tree is opened
  sky.classList.toggle("no-anim", treeDrawnOnce);
  sky.classList.toggle("one-per-page", isPhone);
  treeDrawnOnce = true;

  setUpTooltips(sky, nodes, W);
  setUpDragging(sky);
  setUpArrows(sky, panel, scrollable, step);
}

function line(d, delay) {
  return `<path class="sky-line" pathLength="1" d="${d}" style="animation-delay:${delay}s"/>`;
}

let isDragging = false;
let dragMoved = false;

function setUpTooltips(sky, nodes, W) {
  const tooltip = sky.querySelector(".tooltip");
  const nodeEls = [...sky.querySelectorAll(".node")];
  const title = document.querySelector(".tree-title");

  function show(item, x, top, bottom, el) {
    nodeEls.forEach(n => n.classList.toggle("on", n === el));
    tooltip.innerHTML = `<h4>${escapeHtml(item.label)}</h4><p>${escapeHtml(item.info)}</p>`;
    const tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
    let y = top - 12 - th;
    if (y < sky.scrollTop + 54) y = bottom + 12; // not enough room above
    const minX = sky.scrollLeft + 12, maxX = sky.scrollLeft + W - tw - 12;
    tooltip.style.left = Math.max(minX, Math.min(x - tw / 2, maxX)) + "px";
    tooltip.style.top = y + "px";
    tooltip.classList.add("show");
  }

  function hide() {
    tooltip.classList.remove("show");
    nodeEls.forEach(n => n.classList.remove("on"));
  }

  nodeEls.forEach(el => {
    const item = nodes[Number(el.dataset.index)];
    const showThis = () => {
      if (item.isBranch) show(item, item.x, item.y - 36, item.y + 64, el);
      else {
        const size = Math.max(item.r, 12);
        show(item, item.x, item.y - size - 8, item.y + size + 8, el);
      }
    };
    el.addEventListener("pointerenter", e => { if (e.pointerType === "mouse" && !isDragging) showThis(); });
    el.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") hide(); });
    el.addEventListener("focus", showThis);
    el.addEventListener("blur", hide);
    el.addEventListener("click", e => {
      e.stopPropagation();
      if (!dragMoved) showThis();
    });
  });

  const showRoot = () => {
    const t = title.getBoundingClientRect(), s = sky.getBoundingClientRect();
    show(SKILLS, sky.scrollLeft + W / 2, t.top - s.top + sky.scrollTop, t.bottom - s.top + sky.scrollTop, null);
  };
  title.onpointerenter = e => { if (e.pointerType === "mouse") showRoot(); };
  title.onpointerleave = hide;
  title.onclick = e => { e.stopPropagation(); showRoot(); };

  sky.onclick = e => { if (!e.target.closest(".node")) hide(); };
  sky.hideTooltip = hide;
}

// click and drag to pan with a mouse (touch and trackpads scroll natively)
function setUpDragging(sky) {
  let startX = 0, startY = 0, startLeft = 0, startTop = 0;

  sky.onpointerdown = e => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    isDragging = true;
    dragMoved = false;
    startX = e.clientX;
    startY = e.clientY;
    startLeft = sky.scrollLeft;
    startTop = sky.scrollTop;
  };

  sky.onpointermove = e => {
    if (!isDragging) return;
    const dx = e.clientX - startX, dy = e.clientY - startY;
    if (!dragMoved && Math.hypot(dx, dy) > 6) {
      dragMoved = true;
      sky.classList.add("dragging");
      sky.hideTooltip();
    }
    if (dragMoved) {
      sky.scrollLeft = startLeft - dx;
      sky.scrollTop = startTop - dy;
    }
  };

  window.onpointerup = () => {
    if (!isDragging) return;
    isDragging = false;
    sky.classList.remove("dragging");
    setTimeout(() => { dragMoved = false; }, 0);
  };
}

function setUpArrows(sky, panel, scrollable, step) {
  panel.querySelectorAll(".sky-arrow").forEach(b => b.remove());
  if (!scrollable) {
    sky.onscroll = null;
    return;
  }

  panel.insertAdjacentHTML("beforeend", `
    <button type="button" class="sky-arrow prev" aria-label="Scroll left">‹</button>
    <button type="button" class="sky-arrow next" aria-label="Scroll right">›</button>`);
  const prev = panel.querySelector(".sky-arrow.prev");
  const next = panel.querySelector(".sky-arrow.next");

  const updateArrows = () => {
    prev.disabled = sky.scrollLeft < 4;
    next.disabled = sky.scrollLeft > sky.scrollWidth - sky.clientWidth - 4;
  };

  prev.addEventListener("click", e => { e.stopPropagation(); sky.scrollBy({ left: -step, behavior: "smooth" }); });
  next.addEventListener("click", e => { e.stopPropagation(); sky.scrollBy({ left: step, behavior: "smooth" }); });
  sky.onscroll = () => {
    updateArrows();
    if (!sky.matches(":hover")) sky.hideTooltip();
  };

  sky.scrollLeft = Math.min(sky.scrollLeft, sky.scrollWidth - sky.clientWidth);
  updateArrows();
}

window.addEventListener("resize", () => {
  const open = document.querySelector(".panel.is-shown");
  if (document.body.classList.contains("panel-open") && open && open.id === "panel-skills") buildTree();
});
