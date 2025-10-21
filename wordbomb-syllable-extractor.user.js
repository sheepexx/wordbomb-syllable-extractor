// ==UserScript==
// @name         Wordbomb Syllable Extractor
// @namespace    https://github.com/sheepexx/wordbomb-syllable-extractor
// @version      1.0.0
// @description  Extract syllables from wordbomb.io canvas and copy with counts
// @match        https://wordbomb.io/*
// @grant        GM_setClipboard
// @updateURL    https://raw.githubusercontent.com/sheepexx/wordbomb-syllable-extractor/main/wordbomb-syllable-extractor.user.js
// @downloadURL  https://raw.githubusercontent.com/sheepexx/wordbomb-syllable-extractor/main/wordbomb-syllable-extractor.user.js
// ==/UserScript==

(function () {
  'use strict';
  const order = [];
  const counts = Object.create(null);
  let lastSyl = null;
  const TOKEN_RE = /^[A-Z0-9ÄÖÜß'\-]{1,4}$/i;
  const IS_NUM = /^\d+$/;
  const oldFill = CanvasRenderingContext2D.prototype.fillText;

  CanvasRenderingContext2D.prototype.fillText = function (text, x, y, mw) {
    const h = this.canvas?.height || 0;
    const t = String(text).trim().toUpperCase();
    if (t === '1M') return oldFill.call(this, text, x, y, mw);
    if (h && (y / h) > 0.82 && TOKEN_RE.test(t)) {
      if (IS_NUM.test(t)) { if (lastSyl) { counts[lastSyl] = Math.max(1, Number(t)); lastSyl = null; } }
      else { if (!(t in counts)) { counts[t] = 1; order.push(t); } lastSyl = t; }
    }
    return oldFill.call(this, text, x, y, mw);
  };

  const panel = document.createElement('div');
  Object.assign(panel.style, {
    position:'fixed', right:'12px', bottom:'12px', zIndex:2147483647,
    background:'#fff', border:'1px solid #bbb', borderRadius:'10px',
    boxShadow:'0 6px 18px rgba(0,0,0,.15)', padding:'10px',
    fontFamily:'system-ui, Arial, sans-serif', fontSize:'12px'
  });
  panel.innerHTML = `
    <button id="wb-extract" style="margin-right:8px">Extract syllables</button>
    <button id="wb-copy">Copy</button>
    <span id="wb-status" style="margin-left:10px;opacity:.7"></span>
  `;
  const ready = () => document.body ? document.body.appendChild(panel) : document.addEventListener('DOMContentLoaded', () => document.body.appendChild(panel));
  ready();

  const statusEl = () => document.getElementById('wb-status');
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'wb-extract') {
      order.length = 0; for (const k in counts) delete counts[k]; lastSyl = null;
      const s = statusEl(); if (s) s.textContent = 'hook active – show/scroll the syllables…';
    }
    if (e.target && e.target.id === 'wb-copy') {
      const items = order.map(s => counts[s] > 1 ? `${s}:${counts[s]}` : s);
      const text = items.join(', ');
      try { GM_setClipboard(text); } catch {}
      const s = statusEl(); if (s) s.textContent = `copied ${items.length} items`;
    }
  });
})();
