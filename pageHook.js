(() => {
  if (window.__CanvasHookInstalled__) return;
  window.__CanvasHookInstalled__ = true;

  const order = [];
  const counts = Object.create(null);
  let lastSyl = null;

  const TOKEN_RE = /^[A-Z0-9ÄÖÜß'\-]{1,4}$/i;
  const IS_NUM   = /^\d+$/;

  const oldFill = CanvasRenderingContext2D.prototype.fillText;
  CanvasRenderingContext2D.prototype.fillText = function (text, x, y, mw) {
    const h = this.canvas?.height || 0;
    const t = String(text).trim().toUpperCase();

    // "1M" und ähnliche noise tokens ignorieren
    if (t === "1M") return oldFill.call(this, text, x, y, mw);

    if (h && (y / h) > 0.82 && TOKEN_RE.test(t)) {
      if (IS_NUM.test(t)) {
        // Zahl → gehört zur letzten Silbe
        if (lastSyl) {
          counts[lastSyl] = Math.max(1, Number(t));
          lastSyl = null;
        }
      } else {
        // neue Silbe
        if (!(t in counts)) { counts[t] = 1; order.push(t); }
        lastSyl = t;
      }
    }
    return oldFill.call(this, text, x, y, mw);
  };

  // messaging für content.js
  window.addEventListener("message", (ev) => {
    const d = ev.data;
    if (!d || d.source !== "CanvasHookCS") return;

    if (d.type === "get") {
      const items = order.map(s => (counts[s] > 1 ? `${s}:${counts[s]}` : s));
      ev.source.postMessage({ source: "CanvasHook", type: "data", items }, "*");
    } else if (d.type === "reset") {
      order.length = 0;
      for (const k in counts) delete counts[k];
      lastSyl = null;
    }
  });
})();
