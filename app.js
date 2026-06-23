// RetroStamp PRO Application Logic

// Preset database
const PRESETS = {
  'coolpix-w300': {
    textTemplate: '{MM}.{DD}.{YYYY} {HH}:{mm}',
    fontFamily: 'Arial',
    fontSizePercent: 4.31,
    bold: false,
    aliasing: true,
    cellWidthPercent: 58.8,
    specialOffsetPercent: 20.0,
    fillColor: '#fc6405',
    strokeColor: '#000000',
    strokeWidthPercent: 1.13,
    position: 'bottom-right',
    marginPercentX: 4.45,
    marginPercentY: 9.03
  },
  'retro-orange': {
    textTemplate: '{MM}.{DD}.{YYYY} {HH}:{mm}',
    fontFamily: 'Tahoma',
    fontSizePercent: 4.8,
    bold: true,
    aliasing: true,
    cellWidthPercent: 58.8,
    specialOffsetPercent: 20.0,
    fillColor: '#ff5500',
    strokeColor: '#000000',
    strokeWidthPercent: 1.2,
    position: 'bottom-right',
    marginPercentX: 5.0,
    marginPercentY: 8.0
  },
  'classic-yellow': {
    textTemplate: "'{YY} {MM} {DD}",
    fontFamily: 'Courier New',
    fontSizePercent: 5.5,
    bold: true,
    aliasing: true,
    cellWidthPercent: 58.8,
    specialOffsetPercent: 0.0,
    fillColor: '#ffbb00',
    strokeColor: '#000000',
    strokeWidthPercent: 1.13,
    position: 'bottom-right',
    marginPercentX: 5.0,
    marginPercentY: 5.0
  },
  'minimalist-white': {
    textTemplate: '{YYYY}-{MM}-{DD} {HH}:{mm}',
    fontFamily: 'Verdana',
    fontSizePercent: 2.7,
    bold: false,
    aliasing: false,
    cellWidthPercent: 58.8,
    specialOffsetPercent: 0.0,
    fillColor: '#ffffff',
    strokeColor: '#000000',
    strokeWidthPercent: 1.5,
    position: 'bottom-left',
    marginPercentX: 3.0,
    marginPercentY: 3.0
  }
};

// Application State
let fileQueue = [];
let activeIndex = -1;
let customPresets = {};
let zoomMode = 'fit'; // 'fit' or '100'

// DOM Elements
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('file-input');
const fileList = document.getElementById('file-list');
const queueStatus = document.getElementById('queue-status');
const previewCanvas = document.getElementById('preview-canvas');
const canvasLoader = document.getElementById('canvas-loader');
const previewWrapper = document.getElementById('preview-wrapper');

// Control Inputs
const presetSelect = document.getElementById('preset-select');
const savePresetBtn = document.getElementById('save-preset-btn');
const resetPresetBtn = document.getElementById('reset-preset-btn');
const textFormatInput = document.getElementById('text-format-input');
const overrideDateCheck = document.getElementById('override-date-check');
const customDateContainer = document.getElementById('custom-date-container');
const customDateInput = document.getElementById('custom-date-input');
const fontFamilySelect = document.getElementById('font-family-select');
const fontSizeSlider = document.getElementById('font-size-slider');
const fontSizeVal = document.getElementById('font-size-val');
const fontBoldCheck = document.getElementById('font-bold-check');
const aliasingCheck = document.getElementById('aliasing-check');
const cellWidthSlider = document.getElementById('cell-width-slider');
const cellWidthVal = document.getElementById('cell-width-val');
const specialOffsetSlider = document.getElementById('special-offset-slider');
const specialOffsetVal = document.getElementById('special-offset-val');
const fillColorInput = document.getElementById('fill-color');
const fillColorHex = document.getElementById('fill-color-hex');
const strokeColorInput = document.getElementById('stroke-color');
const strokeColorHex = document.getElementById('stroke-color-hex');
const strokeWidthSlider = document.getElementById('stroke-width-slider');
const strokeWidthVal = document.getElementById('stroke-width-val');
const positionSelect = document.getElementById('position-select');
const marginXSlider = document.getElementById('margin-x-slider');
const marginXVal = document.getElementById('margin-x-val');
const marginYSlider = document.getElementById('margin-y-slider');
const marginYVal = document.getElementById('margin-y-val');

// Action Buttons
const downloadCurrentBtn = document.getElementById('download-current-btn');
const downloadAllBtn = document.getElementById('download-all-btn');
const zoomFitBtn = document.getElementById('zoom-fit-btn');
const zoom100Btn = document.getElementById('zoom-100-btn');
const zoomFactor = document.getElementById('zoom-factor');

// Modals
const savePresetModal = document.getElementById('save-preset-modal');
const presetNameInput = document.getElementById('preset-name-input');
const cancelPresetBtn = document.getElementById('cancel-preset-btn');
const confirmPresetBtn = document.getElementById('confirm-preset-btn');

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
  loadCustomPresets();
  setupEventListeners();
  applyPreset('coolpix-w300');
  
  // Theme initialization
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light-theme');
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) themeBtn.textContent = '🌙';
  }
  
  // Set default custom date to current local time
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(now - offset)).toISOString().slice(0, 16);
  customDateInput.value = localISOTime;
});

// Setup Events
function setupEventListeners() {
  // Drag and Drop
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });
  
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  });

  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  });

  // Settings Value Adjustments
  const inputsToUpdate = [
    { el: fontSizeSlider, valEl: fontSizeVal, key: 'fontSizePercent' },
    { el: cellWidthSlider, valEl: cellWidthVal, key: 'cellWidthPercent' },
    { el: specialOffsetSlider, valEl: specialOffsetVal, key: 'specialOffsetPercent' },
    { el: strokeWidthSlider, valEl: strokeWidthVal, key: 'strokeWidthPercent' },
    { el: marginXSlider, valEl: marginXVal, key: 'marginPercentX' },
    { el: marginYSlider, valEl: marginYVal, key: 'marginPercentY' }
  ];

  inputsToUpdate.forEach(item => {
    item.el.addEventListener('input', (e) => {
      item.valEl.textContent = e.target.value;
      triggerPreviewUpdate();
    });
  });

  // Dual sync Color Pickers
  syncColorInputs(fillColorInput, fillColorHex);
  syncColorInputs(strokeColorInput, strokeColorHex);

  // Selector changes and checks
  textFormatInput.addEventListener('input', triggerPreviewUpdate);
  fontFamilySelect.addEventListener('change', triggerPreviewUpdate);
  fontBoldCheck.addEventListener('change', triggerPreviewUpdate);
  aliasingCheck.addEventListener('change', triggerPreviewUpdate);
  positionSelect.addEventListener('change', triggerPreviewUpdate);
  
  overrideDateCheck.addEventListener('change', (e) => {
    if (e.target.checked) {
      customDateContainer.classList.remove('hidden');
    } else {
      customDateContainer.classList.add('hidden');
    }
    triggerPreviewUpdate();
  });
  customDateInput.addEventListener('input', triggerPreviewUpdate);

  // Preset loading
  presetSelect.addEventListener('change', (e) => {
    applyPreset(e.target.value);
  });

  // Save Preset Actions
  savePresetBtn.addEventListener('click', () => {
    savePresetModal.classList.remove('hidden');
    presetNameInput.value = '';
    presetNameInput.focus();
  });
  cancelPresetBtn.addEventListener('click', () => savePresetModal.classList.add('hidden'));
  confirmPresetBtn.addEventListener('click', saveCurrentAsCustomPreset);
  
  // Reset active preset default settings
  resetPresetBtn.addEventListener('click', () => {
    applyPreset(presetSelect.value);
  });

  // Zoom Button Actions
  zoomFitBtn.addEventListener('click', () => {
    zoomMode = 'fit';
    updateZoomUI();
  });
  zoom100Btn.addEventListener('click', () => {
    zoomMode = '100';
    updateZoomUI();
  });

  // Theme Toggle Actions
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.documentElement.classList.toggle('light-theme');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      themeToggleBtn.textContent = isLight ? '🌙' : '☀️';
    });
  }

  // Action Triggers
  downloadCurrentBtn.addEventListener('click', burnAndDownloadCurrent);
  downloadAllBtn.addEventListener('click', batchProcessAndZip);
}

// Helper to sync Hex text input and color picker
function syncColorInputs(pickerEl, hexEl) {
  pickerEl.addEventListener('input', (e) => {
    hexEl.value = e.target.value;
    triggerPreviewUpdate();
  });
  hexEl.addEventListener('input', (e) => {
    const val = e.target.value;
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      pickerEl.value = val;
      triggerPreviewUpdate();
    }
  });
}

// Load Custom Presets from LocalStorage
function loadCustomPresets() {
  try {
    const stored = localStorage.getItem('retro_presets');
    if (stored) {
      customPresets = JSON.parse(stored);
      // Populate dropdown
      for (const name in customPresets) {
        addPresetOptionToDropdown(name, `custom-${name}`);
      }
    }
  } catch (e) {
    console.error('Failed to load custom presets', e);
  }
}

// Add option element helper
function addPresetOptionToDropdown(label, value) {
  const opt = document.createElement('option');
  opt.value = value;
  opt.textContent = label;
  
  // Find custom presets disabled header or append
  let customHeader = presetSelect.querySelector('option[value="custom"]');
  if (!customHeader) {
    customHeader = document.createElement('option');
    customHeader.value = "custom";
    customHeader.textContent = "-- Custom Presets --";
    customHeader.disabled = true;
    presetSelect.appendChild(customHeader);
  }
  
  presetSelect.appendChild(opt);
}

// Save preset from current UI variables
function saveCurrentAsCustomPreset() {
  const name = presetNameInput.value.trim();
  if (!name) return;
  
  const presetKey = `custom-${name}`;
  const settings = getSettingsFromUI();
  
  customPresets[name] = settings;
  localStorage.setItem('retro_presets', JSON.stringify(customPresets));
  
  // Update UI selector
  // Check if option already exists
  let existingOpt = presetSelect.querySelector(`option[value="${presetKey}"]`);
  if (!existingOpt) {
    addPresetOptionToDropdown(name, presetKey);
  }
  
  presetSelect.value = presetKey;
  savePresetModal.classList.add('hidden');
}

// Retrieve setting variables from UI controls
function getSettingsFromUI() {
  return {
    textTemplate: textFormatInput.value,
    fontFamily: fontFamilySelect.value,
    fontSizePercent: parseFloat(fontSizeSlider.value),
    bold: fontBoldCheck.checked,
    aliasing: aliasingCheck.checked,
    cellWidthPercent: parseFloat(cellWidthSlider.value),
    specialOffsetPercent: parseFloat(specialOffsetSlider.value),
    fillColor: fillColorInput.value,
    strokeColor: strokeColorInput.value,
    strokeWidthPercent: parseFloat(strokeWidthSlider.value),
    position: positionSelect.value,
    marginPercentX: parseFloat(marginXSlider.value),
    marginPercentY: parseFloat(marginYSlider.value)
  };
}

// Apply Selected Preset Values
function applyPreset(key) {
  let settings;
  if (key.startsWith('custom-')) {
    const rawKey = key.replace('custom-', '');
    settings = customPresets[rawKey];
  } else {
    settings = PRESETS[key];
  }
  
  if (!settings) return;

  textFormatInput.value = settings.textTemplate;
  fontFamilySelect.value = settings.fontFamily;
  fontSizeSlider.value = settings.fontSizePercent;
  fontSizeVal.textContent = settings.fontSizePercent;
  fontBoldCheck.checked = settings.bold;
  aliasingCheck.checked = settings.aliasing;
  cellWidthSlider.value = settings.cellWidthPercent;
  cellWidthVal.textContent = settings.cellWidthPercent;
  specialOffsetSlider.value = settings.specialOffsetPercent;
  specialOffsetVal.textContent = settings.specialOffsetPercent;
  
  fillColorInput.value = settings.fillColor;
  fillColorHex.value = settings.fillColor;
  strokeColorInput.value = settings.strokeColor;
  strokeColorHex.value = settings.strokeColor;
  
  strokeWidthSlider.value = settings.strokeWidthPercent;
  strokeWidthVal.textContent = settings.strokeWidthPercent;
  positionSelect.value = settings.position;
  marginXSlider.value = settings.marginPercentX;
  marginXVal.textContent = settings.marginPercentX;
  marginYSlider.value = settings.marginPercentY;
  marginYVal.textContent = settings.marginPercentY;
  
  triggerPreviewUpdate();
}

// File Queue Handling with Scaling and Caching
async function handleFiles(files) {
  showLoader();
  const newItems = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.type.startsWith('image/')) continue;
    
    const item = {
      file: file,
      name: file.name,
      size: formatBytes(file.size),
      processed: false,
      imageUrl: URL.createObjectURL(file),
      exifDate: null,
      previewCanvas: null,
      width: 0,
      height: 0
    };
    
    // Parse exif metadata (supporting multiple tags)
    try {
      const meta = await window.exifr.parse(file);
      if (meta) {
        const exifDate = meta.DateTimeOriginal || meta.CreateDate || meta.ModifyDate || meta.DateTime;
        if (exifDate) {
          item.exifDate = new Date(exifDate);
        }
      }
    } catch (e) {
      console.warn('EXIF parse error for file ' + file.name, e);
    }
    
    // Load image to create scaled down preview canvas
    await new Promise((resolve) => {
      const img = new Image();
      img.src = item.imageUrl;
      img.onload = () => {
        item.width = img.width;
        item.height = img.height;
        
        // Define maximum preview dimension (1200px)
        const maxDim = 1200;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        
        // Render onto cached canvas
        const pCanvas = document.createElement('canvas');
        pCanvas.width = w;
        pCanvas.height = h;
        const pCtx = pCanvas.getContext('2d');
        pCtx.drawImage(img, 0, 0, w, h);
        item.previewCanvas = pCanvas;
        
        resolve();
      };
      img.onerror = () => {
        resolve();
      };
    });
    
    newItems.push(item);
  }
  
  if (newItems.length > 0) {
    fileQueue = [...fileQueue, ...newItems];
    renderFileList();
    
    // Auto select first file if none active
    if (activeIndex === -1) {
      selectFile(fileQueue.length - newItems.length);
    }
    
    updateQueueStatus();
    downloadAllBtn.disabled = false;
  }
  hideLoader();
}

// Render queue view sidebar
function renderFileList() {
  if (fileQueue.length === 0) {
    fileList.innerHTML = `<div class="empty-state"><p>Queue is empty</p></div>`;
    downloadCurrentBtn.disabled = true;
    downloadAllBtn.disabled = true;
    return;
  }
  
  fileList.innerHTML = '';
  fileQueue.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = `file-item ${index === activeIndex ? 'active' : ''}`;
    div.addEventListener('click', () => selectFile(index));
    
    div.innerHTML = `
      <img src="${item.imageUrl}" class="file-thumb" alt="thumbnail">
      <div class="file-info">
        <div class="file-name">${item.name}</div>
        <div class="file-meta">${item.size} | ${item.exifDate ? formatDateSimple(item.exifDate) : 'No EXIF Date'}</div>
      </div>
      <button class="remove-file-btn" onclick="event.stopPropagation(); removeFile(${index})">✕</button>
    `;
    fileList.appendChild(div);
  });
}

// Select active queue file
function selectFile(index) {
  if (index < 0 || index >= fileQueue.length) return;
  
  activeIndex = index;
  const items = fileList.querySelectorAll('.file-item');
  items.forEach((item, idx) => {
    if (idx === index) item.classList.add('active');
    else item.classList.remove('active');
  });

  downloadCurrentBtn.disabled = false;
  
  const item = fileQueue[activeIndex];
  if (item.exifDate) {
    const offset = item.exifDate.getTimezoneOffset() * 60000;
    customDateInput.value = (new Date(item.exifDate - offset)).toISOString().slice(0, 16);
  }
  
  triggerPreviewUpdate();
}

// Delete item from queue
function removeFile(index) {
  URL.revokeObjectURL(fileQueue[index].imageUrl);
  fileQueue.splice(index, 1);
  
  if (fileQueue.length === 0) {
    activeIndex = -1;
  } else if (activeIndex >= fileQueue.length) {
    activeIndex = fileQueue.length - 1;
  }
  
  renderFileList();
  if (activeIndex !== -1) {
    selectFile(activeIndex);
  } else {
    const ctx = previewCanvas.getContext('2d');
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
  }
  updateQueueStatus();
}

function updateQueueStatus() {
  if (fileQueue.length === 0) {
    queueStatus.textContent = 'No files loaded';
  } else {
    queueStatus.textContent = `${fileQueue.length} image${fileQueue.length > 1 ? 's' : ''} loaded`;
  }
}

// Render Preview Trigger
let previewTimeout = null;
function triggerPreviewUpdate() {
  if (previewTimeout) clearTimeout(previewTimeout);
  previewTimeout = setTimeout(() => {
    updatePreviewCanvas();
  }, 30);
}

// Optimized preview drawing (uses cached scaled down canvas)
async function updatePreviewCanvas() {
  if (activeIndex === -1) return;
  showLoader();
  
  const item = fileQueue[activeIndex];
  if (!item.previewCanvas) {
    hideLoader();
    return;
  }
  
  const W = item.previewCanvas.width;
  const H = item.previewCanvas.height;
  
  previewCanvas.width = W;
  previewCanvas.height = H;
  
  const ctx = previewCanvas.getContext('2d');
  ctx.drawImage(item.previewCanvas, 0, 0);
  
  // Get date object
  let dateObj = item.exifDate || new Date();
  if (overrideDateCheck.checked) {
    dateObj = new Date(customDateInput.value);
  }
  
  const text = formatTemplate(textFormatInput.value, dateObj);
  const settings = getSettingsFromUI();
  
  // Render timestamp relative to scaled coordinates
  drawTimestamp(ctx, text, W, H, settings);
  updateZoomUI();
  hideLoader();
}

// Core drawing method on any canvas
function drawTimestamp(ctx, text, W, H, settings) {
  const fontSize = H * (settings.fontSizePercent / 100);
  // Spacing and offsets are now percentage-based relative to the font size directly.
  // This automatically locks the character aspect ratios across all photo dimensions.
  const cellW = fontSize * (settings.cellWidthPercent / 100);
  const offsetSpecial = fontSize * (settings.specialOffsetPercent / 100);
  const strokeW = fontSize * (settings.strokeWidthPercent / 100);
  const marginX = W * (settings.marginPercentX / 100);
  const marginY = H * (settings.marginPercentY / 100);
  
  const fontStr = `${settings.bold ? 'bold ' : ''}${fontSize}px "${settings.fontFamily}"`;
  
  const totalChars = text.length;
  const totalTextWidth = (totalChars - 1) * cellW + cellW * 0.8;
  
  // Baseline placement Y
  let baselineY = H - marginY;
  if (settings.position.startsWith('top')) {
    baselineY = marginY + fontSize * 0.8;
  }
  
  // Start position X
  let startX = marginX;
  if (settings.position.endsWith('right')) {
    startX = W - marginX - totalTextWidth;
  }
  
  ctx.save();
  
  if (settings.aliasing) {
    // Sharp bi-level aliased rendering
    for (let i = 0; i < totalChars; i++) {
      const char = text[i];
      let x = startX + i * cellW;
      if (char === '.' || char === ':') {
        x += offsetSpecial;
      }
      
      const charAsset = renderAliasedChar(char, fontStr, settings.fillColor, settings.strokeColor, strokeW, fontSize);
      ctx.drawImage(charAsset.canvas, x - charAsset.offsetX, baselineY - charAsset.offsetY);
    }
  } else {
    // Normal browser anti-aliased rendering
    ctx.font = fontStr;
    ctx.textBaseline = 'alphabetic';
    
    for (let i = 0; i < totalChars; i++) {
      const char = text[i];
      let x = startX + i * cellW;
      if (char === '.' || char === ':') {
        x += offsetSpecial;
      }
      
      if (strokeW > 0) {
        ctx.strokeStyle = settings.strokeColor;
        ctx.lineWidth = strokeW * 2;
        ctx.lineJoin = 'round';
        ctx.strokeText(char, x, baselineY);
      }
      
      ctx.fillStyle = settings.fillColor;
      ctx.fillText(char, x, baselineY);
    }
  }
  
  ctx.restore();
}

// Binarized Aliased Character Renderer (Optimized Single Sweep)
function renderAliasedChar(char, fontStr, fillColor, strokeColor, strokeWidth) {
  // Extract font size from string
  const sizeMatch = fontStr.match(/(\d+(?:\.\d+)?)px/);
  const fontSize = sizeMatch ? parseFloat(sizeMatch[1]) : 30;
  
  const tempW = Math.ceil(fontSize * 2.2);
  const tempH = Math.ceil(fontSize * 2.2);
  
  const canvas = document.createElement('canvas');
  canvas.width = tempW;
  canvas.height = tempH;
  const ctx = canvas.getContext('2d');
  
  const anchorX = fontSize * 0.5;
  const anchorY = fontSize * 1.5;
  
  ctx.font = fontStr;
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  
  // 1. Draw outline stroke in pure black
  if (strokeWidth > 0) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = strokeWidth * 2;
    ctx.strokeText(char, anchorX, anchorY);
  }
  
  // 2. Draw interior fill in pure white
  ctx.fillStyle = '#ffffff';
  ctx.fillText(char, anchorX, anchorY);
  
  // 3. Apply Threshold and Recolor in single sweep
  const imgData = ctx.getImageData(0, 0, tempW, tempH);
  const pixels = imgData.data;
  const fillRGB = hexToRgb(fillColor);
  const strokeRGB = hexToRgb(strokeColor);
  
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i+1];
    const b = pixels[i+2];
    const a = pixels[i+3];
    
    if (a > 127) {
      // White pixels represent the fill
      if (r > 200 && g > 200 && b > 200) {
        pixels[i] = fillRGB.r;
        pixels[i+1] = fillRGB.g;
        pixels[i+2] = fillRGB.b;
      } else {
        // Gray/black pixels represent the stroke boundary
        pixels[i] = strokeRGB.r;
        pixels[i+1] = strokeRGB.g;
        pixels[i+2] = strokeRGB.b;
      }
      pixels[i+3] = 255; // solid output
    } else {
      pixels[i+3] = 0; // transparent
    }
  }
  ctx.putImageData(imgData, 0, 0);
  
  return {
    canvas: canvas,
    offsetX: anchorX,
    offsetY: anchorY
  };
}

// Convert Hex string color (#ff0000) to RGB components object
function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 252, g: 100, b: 5 };
}

// Process and Download active photo (at full original resolution)
async function burnAndDownloadCurrent() {
  if (activeIndex === -1) return;
  showLoader();
  
  const item = fileQueue[activeIndex];
  const settings = getSettingsFromUI();
  
  const img = new Image();
  img.src = item.imageUrl;
  await new Promise(r => img.onload = r);
  
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  
  let dateObj = item.exifDate || new Date();
  if (overrideDateCheck.checked) {
    dateObj = new Date(customDateInput.value);
  }
  const text = formatTemplate(textFormatInput.value, dateObj);
  
  drawTimestamp(ctx, text, img.width, img.height, settings);
  
  canvas.toBlob((blob) => {
    const link = document.createElement('a');
    link.download = item.name.replace(/\.[^/.]+$/, "") + "_burned.jpg";
    link.href = URL.createObjectURL(blob);
    link.click();
    
    setTimeout(() => URL.revokeObjectURL(link.href), 100);
    hideLoader();
  }, 'image/jpeg', 0.95);
}

// Batch Process all queue files (at full resolution) and download as Zip
async function batchProcessAndZip() {
  if (fileQueue.length === 0) return;
  showLoader();
  
  const zip = new JSZip();
  const settings = getSettingsFromUI();
  
  for (let idx = 0; idx < fileQueue.length; idx++) {
    const item = fileQueue[idx];
    
    const img = new Image();
    img.src = item.imageUrl;
    await new Promise(r => img.onload = r);
    
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    let dateObj = item.exifDate || new Date();
    if (overrideDateCheck.checked) {
      dateObj = new Date(customDateInput.value);
    }
    const text = formatTemplate(textFormatInput.value, dateObj);
    
    drawTimestamp(ctx, text, img.width, img.height, settings);
    
    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.95);
    });
    
    const outName = item.name.replace(/\.[^/.]+$/, "") + "_burned.jpg";
    zip.file(outName, blob);
  }
  
  const content = await zip.generateAsync({ type: 'blob' });
  const link = document.createElement('a');
  link.download = "timestamp_burned_photos.zip";
  link.href = URL.createObjectURL(content);
  link.click();
  
  setTimeout(() => URL.revokeObjectURL(link.href), 100);
  hideLoader();
}

// Update Canvas zooming logic in UI container
function updateZoomUI() {
  if (!previewCanvas.width) return;
  
  const wrapperWidth = previewWrapper.clientWidth;
  const wrapperHeight = previewWrapper.clientHeight;
  const canvasRatio = previewCanvas.width / previewCanvas.height;
  const wrapperRatio = wrapperWidth / wrapperHeight;
  
  if (zoomMode === 'fit') {
    previewCanvas.style.width = '100%';
    previewCanvas.style.height = '100%';
    previewCanvas.style.maxWidth = '100%';
    previewCanvas.style.maxHeight = '100%';
    
    let activeZoom = 100;
    if (canvasRatio > wrapperRatio) {
      activeZoom = (wrapperWidth / previewCanvas.width) * 100;
    } else {
      activeZoom = (wrapperHeight / previewCanvas.height) * 100;
    }
    zoomFactor.textContent = Math.round(activeZoom);
  } else {
    previewCanvas.style.width = `${previewCanvas.width}px`;
    previewCanvas.style.height = `${previewCanvas.height}px`;
    previewCanvas.style.maxWidth = 'none';
    previewCanvas.style.maxHeight = 'none';
    zoomFactor.textContent = '100';
  }
}

// Window resizing adjustments
window.addEventListener('resize', updateZoomUI);

// Formatting Template Strings helper
function formatTemplate(template, date) {
  const pad = (num, size = 2) => String(num).padStart(size, '0');
  
  const formats = {
    '{MM}': pad(date.getMonth() + 1),
    '{DD}': pad(date.getDate()),
    '{YYYY}': date.getFullYear(),
    '{YY}': pad(date.getFullYear() % 100),
    '{HH}': pad(date.getHours()),
    '{mm}': pad(date.getMinutes()),
    '{ss}': pad(date.getSeconds())
  };
  
  let formatted = template;
  for (const tag in formats) {
    formatted = formatted.replaceAll(tag, formats[tag]);
  }
  return formatted;
}

// Simple date formatter for sidebar
function formatDateSimple(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getMonth() + 1)}.${pad(date.getDate())}.${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Size formatter helper
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Loader UI toggles
function showLoader() {
  canvasLoader.classList.remove('hidden');
}

function hideLoader() {
  canvasLoader.classList.add('hidden');
}
