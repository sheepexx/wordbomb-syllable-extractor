// pageHook in die seite injizieren (wegen isolated world)
(function inject() {
  const s = document.createElement("script");
  s.src = chrome.runtime.getURL("pageHook.js");
  (document.head || document.documentElement).appendChild(s);
  s.onload = () => s.remove();
})();

// panel mit 2 buttons
function makePanel() {
  const panel = document.createElement("div");
  panel.id = "canvas-syllable-panel";
  panel.innerHTML = `
    <button id="btnExtract" style="margin-right:8px">Extract syllables</button>
    <button id="btnCopy">Copy</button>
    <span id="panelStatus" style="margin-left:10px;font:12px/1.2 system-ui;opacity:.7"></span>
  `;
  Object.assign(panel.style, {
    position: "fixed",
    right: "12px",
    bottom: "12px",
    zIndex: 2147483647,
    background: "#fff",
    border: "1px solid #bbb",
    borderRadius: "10px",
    boxShadow: "0 6px 18px rgba(0,0,0,.15)",
    padding: "10px",
    fontFamily: "system-ui, Arial, sans-serif"
  });
  return panel;
}

function ensurePanel() {
  if (document.getElementById("canvas-syllable-panel")) return;
  const p = makePanel();
  const append = () => document.body.appendChild(p);
  if (document.body) append(); else document.addEventListener("DOMContentLoaded", append);

  const status = () => document.getElementById("panelStatus");

  document.addEventListener("click", (e) => {
    const id = e.target && e.target.id;
    if (id === "btnExtract") {
      // reset zählt ab hier neu
      window.postMessage({ source: "CanvasHookCS", type: "reset" }, "*");
      const el = status(); if (el) el.textContent = "hook active – zeige/scroll die silben…";
    }
    if (id === "btnCopy") {
      window.postMessage({ source: "CanvasHookCS", type: "get" }, "*");
    }
  });

  window.addEventListener("message", async (ev) => {
    const d = ev.data;
    if (!d || d.source !== "CanvasHook" || d.type !== "data") return;
    const items = d.items || []; // z. B. ["H:2","AP:5","-:3","':1", ...]
    const text = items.join(", ");
    try {
      await navigator.clipboard.writeText(text);
      const el = status(); if (el) el.textContent = `copied ${items.length} items ✓`;
      const btn = document.getElementById("btnCopy");
      if (btn) { const old = btn.textContent; btn.textContent = "Copied ✓"; setTimeout(()=>btn.textContent=old, 1000); }
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
      const el = status(); if (el) el.textContent = `copied (fallback) ${items.length} items ✓`;
    }
  });
}
ensurePanel();
