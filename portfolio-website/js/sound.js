// Click sound effect, played with the Web Audio API so it starts instantly
// and can be restarted on every click.

const sound = (() => {
  const SOURCE = "assets/sounds/click.mp3";
  let audio = null;
  let buffer = null;
  let current = null;
  let lastPlayed = 0;
  let muted = false;
  try { muted = localStorage.getItem("muted") === "1"; } catch (e) { /* storage unavailable */ }

  async function loadSound() {
    const response = await fetch(SOURCE);
    return response.arrayBuffer();
  }

  function context() {
    if (!audio) {
      audio = new (window.AudioContext || window.webkitAudioContext)();
      loadSound()
        .then(data => audio.decodeAudioData(data))
        .then(decoded => { buffer = decoded; })
        .catch(() => { /* sound stays off if the file can't load */ });
    }
    if (audio.state === "suspended") audio.resume();
    return audio;
  }

  function play() {
    lastPlayed = performance.now();
    const ac = context();
    if (muted || !buffer) return;

    if (current) {
      try { current.stop(); } catch (e) { /* already stopped */ }
    }
    const source = ac.createBufferSource();
    const gain = ac.createGain();
    gain.gain.value = 0.6;
    source.buffer = buffer;
    source.connect(gain).connect(ac.destination);
    source.start();
    current = source;
  }

  // every click plays the sound once, even if a handler also calls play()
  document.addEventListener("click", () => {
    const clickedAt = performance.now();
    setTimeout(() => { if (lastPlayed < clickedAt) play(); }, 0);
  }, true);

  // start loading early so the first click isn't silent
  ["pointerdown", "keydown"].forEach(type =>
    document.addEventListener(type, () => context(), { once: true, capture: true }));

  function setMuted(value) {
    muted = value;
    try { localStorage.setItem("muted", value ? "1" : "0"); } catch (e) { /* storage unavailable */ }
  }

  return { play, setMuted, isMuted: () => muted };
})();

const soundToggle = document.getElementById("soundToggle");
const updateSoundToggle = () => {
  soundToggle.classList.toggle("muted", sound.isMuted());
  soundToggle.setAttribute("aria-label", sound.isMuted() ? "Turn sound on" : "Turn sound off");
};
soundToggle.addEventListener("click", e => {
  e.stopPropagation();
  sound.setMuted(!sound.isMuted());
  updateSoundToggle();
  sound.play();
});
updateSoundToggle();
