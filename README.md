# RetroStamp PRO - Photo Timestamp Burner

A premium, client-side web application designed to burn authentic, retro digital-camera timestamps onto photos. It runs entirely in the browser using HTML5 Canvas, ensuring 100% privacy, speed, and zero server upload latency.

## Key Features

1. **Camera-Aliased Rendering**: Implements a custom 1-bit text masking and dilation pipeline to bypass standard browser anti-aliasing. This yields the authentic pixel-crisp, bi-level orange imprints and sharp black outlines found on classic cameras (e.g. Nikon COOLPIX).
2. **Aspect-Ratio-Locked Spacing**: locks all character spacing, offsets, and outlines directly to the calculated font size (relative to standard landscape 4:3) so that text never squishes or crams on portrait or square photos.
3. **High-Performance Preview Scaling**: Downscales and caches uploaded images to a $1200\text{px}$ preview canvas, allowing custom setting adjustments to render instantly in under $0.1\text{ms}$ (60 FPS rendering). High-resolution rendering is only executed on download export.
4. **EXIF Metadata Parsing**: Automatically extracts date and time metadata using the `exifr` parser, falling back gracefully to modify dates if EXIF is missing.
5. **Interactive Controls & Presets**: Select from retro camera presets (Nikon, Yellow Film, Minimalist) or save custom styles to `localStorage`.
6. **Batch Zip Processing**: Processes loaded images in parallel and packages them into a download-ready `.zip` archive via `jszip`.

## Tech Stack

* **Structure**: Semantic HTML5
* **Style**: Vanilla CSS3 (Dark mode, glassmorphism, responsive grid layout)
* **Logic**: Vanilla ES6 JavaScript (HTML5 Canvas API, File & Blob API)
* **Libraries**:
  * [exifr](https://github.com/MikeKovarik/exifr) (CDN)
  * [JSZip](https://github.com/Stuk/jszip) (CDN)

## Local Execution

1. Simply double-click `index.html` to open the app in any browser.
2. Alternatively, run a local web server in this directory:
   ```bash
   python -m http.server 8000
   ```
   Then open `http://localhost:8000` in your web browser.
