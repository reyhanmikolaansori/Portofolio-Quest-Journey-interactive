// Pause-style menu: click anywhere (or press a key) to open the compass,
// pick a direction to open its window, Esc or ← to go back.

const body = document.body;
const menu = document.getElementById("menu");
const menuItems = [...document.querySelectorAll(".menu-item")];
const rosePoints = [...document.querySelectorAll(".rose-point")];
const panels = [...document.querySelectorAll(".panel")];
const isPhone = window.matchMedia("(max-width: 720px)");

let menuOpen = false;
let selected = 0;

function select(index) {
  selected = (index + menuItems.length) % menuItems.length;
  const name = menuItems[selected].dataset.panel;

  menuItems.forEach((item, i) => {
    item.classList.toggle("is-active", i === selected);
    item.setAttribute("aria-current", i === selected ? "true" : "false");
  });
  rosePoints.forEach(point => point.classList.toggle("is-active", point.dataset.panel === name));
  panels.forEach(panel => panel.classList.toggle("is-shown", panel.id === "panel-" + name));
}

function indexOf(name) {
  return menuItems.findIndex(item => item.dataset.panel === name);
}

function currentPanel() {
  return panels.find(panel => panel.classList.contains("is-shown"));
}

function openMenu(panelName) {
  sound.play();
  menuOpen = true;
  body.classList.add("menu-open");
  menu.setAttribute("aria-hidden", "false");

  if (panelName) {
    select(indexOf(panelName));
    openPanel();
  } else {
    select(selected);
    menuItems[selected].focus({ preventScroll: true });
  }
}

function closeMenu() {
  menuOpen = false;
  body.classList.remove("menu-open", "panel-open");
  menu.setAttribute("aria-hidden", "true");
  if (document.activeElement) document.activeElement.blur();
}

function openPanel() {
  sound.play();
  body.classList.add("panel-open");
  const panel = currentPanel();
  if (!panel) return;
  panel.focus({ preventScroll: true });
  if (panel.id === "panel-skills") buildTree();
}

function goBack() {
  sound.play();
  if (body.classList.contains("panel-open")) {
    body.classList.remove("panel-open");
    menuItems[selected].focus({ preventScroll: true });
  } else {
    closeMenu();
  }
}

menuItems.forEach((item, i) => {
  item.addEventListener("mouseenter", () => { if (!isPhone.matches) select(i); });
  item.addEventListener("focus", () => select(i));
  item.addEventListener("click", e => {
    e.stopPropagation();
    select(i);
    openPanel();
  });
});

rosePoints.forEach(point => {
  const i = indexOf(point.dataset.panel);
  point.addEventListener("mouseenter", () => { if (!isPhone.matches) select(i); });
  point.addEventListener("click", e => {
    e.stopPropagation();
    select(i);
    openPanel();
  });
});

document.querySelectorAll(".back-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();
    goBack();
  });
});

document.getElementById("questTracker").addEventListener("click", e => {
  e.stopPropagation();
  openMenu("projects");
});

// links inside a window that jump to another window
document.querySelectorAll("[data-goto]").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    select(indexOf(link.dataset.goto));
    openPanel();
  });
});

document.addEventListener("click", e => {
  if (!menuOpen) {
    openMenu();
    return;
  }
  if (body.classList.contains("panel-open")) {
    if (!e.target.closest(".panel")) goBack();
    return;
  }
  if (!e.target.closest(".rose")) closeMenu();
});

document.addEventListener("keydown", e => {
  if (["Tab", "Shift", "Control", "Alt", "Meta"].includes(e.key)) return;

  if (!menuOpen) {
    e.preventDefault();
    openMenu();
    return;
  }

  const inPanel = body.classList.contains("panel-open");
  switch (e.key) {
    case "ArrowRight": case "ArrowDown": case "d": case "D": case "s": case "S":
      if (inPanel) break;
      e.preventDefault();
      select(selected + 1);
      menuItems[selected].focus({ preventScroll: true });
      break;
    case "ArrowLeft": case "ArrowUp": case "a": case "A": case "w": case "W":
      if (inPanel) break;
      e.preventDefault();
      select(selected - 1);
      menuItems[selected].focus({ preventScroll: true });
      break;
    case "Escape":
    case "Backspace":
      e.preventDefault();
      goBack();
      break;
  }
});
