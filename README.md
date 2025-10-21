# Canvas Syllable Extractor

A lightweight Chrome extension that hooks into the browser’s `CanvasRenderingContext2D.fillText` method to extract all syllables drawn on a canvas (for example, in games like Wordbomb).  
It collects each syllable along with its count and provides two simple buttons:

- **Extract syllables** – activates or resets the hook  
- **Copy** – copies all detected syllables with their quantities (e.g., `AKE, AN, AP:2, B:2`)

---

## Installation

## Quick Install (Tampermonkey)
1. Install Tampermonkey.
2. Click to install the userscript:
   https://raw.githubusercontent.com/sheepexx/wordbomb-syllable-extractor/main/wordbomb-syllable-extractor.user.js

## Offline Download

1. **Clone or download the repository**
   ```bash
   git clone https://github.com/yourname/canvas-syllable-extractor.git
   ```
   Or download the ZIP archive and extract it.

2. **Open Chrome** and navigate to (paste in your URL bar):
   ```
   chrome://extensions/
   ```

3. **Enable Developer mode** (toggle in the upper right corner).

4. **Click "Load unpacked"** and select the project folder  
   (for example, `canvas-syllable-extractor/`).

5. The extension should now appear in your extensions list.

---

## Usage

1. Open the game or website that uses a canvas (for example, Wordbomb).  
2. A small panel will appear in the lower-right corner of the page with two buttons:
   - **Extract syllables** – starts or resets the collection process.  
   - **Copy** – copies all detected syllables and their counts to your clipboard.  
3. You can paste the copied text into [my regex tool](https://sheepexx.github.io/syllable-regex-generator/) for further processing.

---

## File Overview

| File | Description |
|------|--------------|
| `manifest.json` | Chrome extension configuration file |
| `content.js` | Handles UI creation and communication with the injected script |
| `pageHook.js` | Hooks `fillText` and extracts syllables from the canvas |

---

## Notes

- The visible area for detection is defined in `pageHook.js` with `(y / h) > 0.82`.  
  Adjust this value if the syllable area is positioned differently on your screen.  
- Tokens like `1M` are automatically ignored.  
- The extractor supports letters, numbers, hyphens (`-`), and apostrophes (`'`).
