// ===================================
// GLOBAL STATE
// ===================================
const state = {
    currentTab: 'denoising',
    currentClass: 'boot',
    currentNoise: 0.3,
    isAnimating: false
};

// Discrete noise anchor levels that match stored images
const NOISE_LEVELS = [0.1, 0.3, 0.5, 0.7, 0.9];

// Pipeline globals — completely separate from noise slider
const ENCODER_LAYERS = [784, 512, 256, 128, 64, 32, 16, 8, 4, 2];
const DECODER_LAYERS = [2, 4, 8, 16, 32, 64, 128, 256, 512, 784];
let ANIM_STEPS = [];


// ===================================
// IMAGE PRELOADING CACHE
// ===================================
// Cache structure: IMAGE_CACHE[class][type][noiseLevel] = HTMLImageElement
const IMAGE_CACHE = {};
let cacheLoadedCount = 0;
let cacheTotalCount = 0;

function buildImageSrc(selectedClass, type, n, level) {
    // type: 'noisy' | 'recon' | 'original'
    if (type === 'original') {
        if (selectedClass === 'trouser') return '../notebook/images/img3_Trouser_original.png';
        if (selectedClass === 'shirt')   return '../notebook/images/original_idx_7.png';
        return '../notebook/images/original.png';
    }
    if (selectedClass === 'trouser') {
        return type === 'noisy'
            ? `../notebook/images/img3_Trouser_L${n}_noise${level}_input.png`
            : `../notebook/images/img3_Trouser_L${n}_noise${level}_output.png`;
    }
    if (selectedClass === 'shirt') {
        if (n === 5) {
            return type === 'noisy'
                ? '../notebook/images/level5_noise_0.9_input shirt.png'
                : '../notebook/images/level5_noise_0.9_reconstructed_shirt.png';
        }
        return type === 'noisy'
            ? `../notebook/images/level${n}_noise_${level}_inputshirt.png`
            : `../notebook/images/level${n}_noise_${level}_reconstructedshirt.png`;
    }
    // boot (default)
    return type === 'noisy'
        ? `../notebook/images/level${n}_noise_${level}_input.png`
        : `../notebook/images/level${n}_noise_${level}_reconstructed.png`;
}

function preloadAllImages() {
    const classes = ['boot', 'trouser', 'shirt'];
    const levelMeta = [
        { level: '0.1', n: 1 },
        { level: '0.3', n: 2 },
        { level: '0.5', n: 3 },
        { level: '0.7', n: 4 },
        { level: '0.9', n: 5 }
    ];

    classes.forEach(cls => {
        IMAGE_CACHE[cls] = { original: null, noisy: {}, recon: {} };

        // Original image (one per class)
        cacheTotalCount++;
        const origImg = new Image();
        origImg.src = buildImageSrc(cls, 'original', 0, 0);
        origImg.onload  = () => { cacheLoadedCount++; };
        origImg.onerror = () => { cacheLoadedCount++; };
        IMAGE_CACHE[cls].original = origImg;

        // Noisy + recon at each anchor level
        levelMeta.forEach(({ level, n }) => {
            cacheTotalCount += 2;
            const noisyImg = new Image();
            noisyImg.src = buildImageSrc(cls, 'noisy', n, level);
            noisyImg.onload  = () => { cacheLoadedCount++; };
            noisyImg.onerror = () => { cacheLoadedCount++; };
            IMAGE_CACHE[cls].noisy[level] = noisyImg;

            const reconImg = new Image();
            reconImg.src = buildImageSrc(cls, 'recon', n, level);
            reconImg.onload  = () => { cacheLoadedCount++; };
            reconImg.onerror = () => { cacheLoadedCount++; };
            IMAGE_CACHE[cls].recon[level] = reconImg;
        });
    });
}

// Blend two HTMLImageElement objects at factor t (0=all A, 1=all B)
// Returns a data URL
function blendImages(imgA, imgB, t) {
    const W = 200, H = 200;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.globalAlpha = 1;
    ctx.drawImage(imgA, 0, 0, W, H);

    ctx.globalAlpha = t;
    ctx.drawImage(imgB, 0, 0, W, H);

    ctx.globalAlpha = 1;
    return canvas.toDataURL();
}

function updateNoiseImagesSmooth(noiseLevel, selectedClass) {
    const noisyEl = document.getElementById('noisyImage');
    const reconEl = document.getElementById('reconstructedImage');
    const origEl  = document.getElementById('originalImage');
    if (!noisyEl || !reconEl) return;

    const classCache = IMAGE_CACHE[selectedClass];
    if (!classCache) return;

    // Show original image (static per class)
    if (origEl && classCache.original && classCache.original.complete) {
        origEl.src = classCache.original.src;
    }

    // Find lower and upper anchor levels
    const levels = NOISE_LEVELS; // [0.1, 0.3, 0.5, 0.7, 0.9]
    const levelStrings = ['0.1', '0.3', '0.5', '0.7', '0.9'];

    // Clamp input to valid range
    const clamped = Math.max(levels[0], Math.min(levels[levels.length - 1], noiseLevel));

    // Check if exactly on an anchor
    const exactIdx = levels.findIndex(l => Math.abs(l - clamped) < 0.001);
    if (exactIdx !== -1) {
        const ls = levelStrings[exactIdx];
        if (classCache.noisy[ls]) noisyEl.src = classCache.noisy[ls].src;
        if (classCache.recon[ls]) reconEl.src = classCache.recon[ls].src;
        return;
    }

    // Find surrounding anchors
    let lowerIdx = 0;
    for (let i = levels.length - 1; i >= 0; i--) {
        if (levels[i] <= clamped) { lowerIdx = i; break; }
    }
    const upperIdx = Math.min(lowerIdx + 1, levels.length - 1);
    const lowerStr = levelStrings[lowerIdx];
    const upperStr = levelStrings[upperIdx];

    const t = (clamped - levels[lowerIdx]) / (levels[upperIdx] - levels[lowerIdx]);

    const noisyA = classCache.noisy[lowerStr];
    const noisyB = classCache.noisy[upperStr];
    const reconA = classCache.recon[lowerStr];
    const reconB = classCache.recon[upperStr];

    if (noisyA?.complete && noisyB?.complete) {
        noisyEl.src = blendImages(noisyA, noisyB, t);
    }
    if (reconA?.complete && reconB?.complete) {
        reconEl.src = blendImages(reconA, reconB, t);
    }
}

// ===================================
// DENOISING TAB
// ===================================
function initializeDenoisingControls() {
    preloadAllImages();

    const classSelector = document.getElementById('classSelector');
    const noiseSlider   = document.getElementById('noiseSlider');
    const noiseValue    = document.getElementById('noiseValue');

    if (classSelector) {
        classSelector.value = state.currentClass;
        classSelector.addEventListener('change', e => {
            state.currentClass = e.target.value;
            updateNoiseImagesSmooth(state.currentNoise, state.currentClass);
        });
    }

    if (noiseSlider && noiseValue) {
        noiseSlider.value = state.currentNoise * 100;
        noiseValue.textContent = state.currentNoise.toFixed(2);

        let rafId = null;
        noiseSlider.addEventListener('input', e => {
            const raw = parseFloat(e.target.value) / 100;
            state.currentNoise = raw;
            noiseValue.textContent = raw.toFixed(2);

            // Throttle via requestAnimationFrame for smooth 60fps rendering
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                updateNoiseImagesSmooth(raw, state.currentClass);
                rafId = null;
            });
        });
    }

    updateNoiseImagesSmooth(state.currentNoise, state.currentClass);
}

function generateAnimationSteps() {
    ANIM_STEPS = [
        { action: 'processing', id: 'pipe-img-input-wrap' },
        { action: 'flow', id: 'arr-enc-in' },
        { action: 'activate', id: 'enc-0' }
    ];
    for (let i = 1; i < ENCODER_LAYERS.length; i++) {
        ANIM_STEPS.push({ action: 'flow', id: `arr-enc-${i}` });
        ANIM_STEPS.push({ action: 'activate', id: `enc-${i}` });
    }
    ANIM_STEPS.push({ action: 'flow', id: 'arr-bridge-in' });
    ANIM_STEPS.push({ action: 'activate', id: 'pipe-latent', delay: 700 });
    ANIM_STEPS.push({ action: 'flow', id: 'arr-bridge-out' });
    ANIM_STEPS.push({ action: 'activate', id: 'dec-0' });
    for (let i = 1; i < DECODER_LAYERS.length; i++) {
        ANIM_STEPS.push({ action: 'flow', id: `arr-dec-${i}` });
        ANIM_STEPS.push({ action: 'activate', id: `dec-${i}` });
    }
    ANIM_STEPS.push({ action: 'flow', id: 'arr-dec-out' });
    ANIM_STEPS.push({ action: 'processing', id: 'pipe-img-output-wrap' });
    ANIM_STEPS.push({ action: 'showImg', id: 'pipe-img-output-wrap' });
}

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeDenoisingControls();
    
    // Ensure pipeline starts with the default selected in the dropdown
    const modelSelect = document.getElementById('pipelineModelSelect');
    const initialModel = modelSelect ? modelSelect.value : 'denoising';
    
    buildPipelineDOM(initialModel);
    initializePipelineControls();
});

// ===================================
// TAB MANAGEMENT
// ===================================
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentTab = btn.dataset.tab;
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tabContents.forEach(c => {
                c.classList.remove('active');
                if (c.id === btn.dataset.tab) c.classList.add('active');
            });
        });
    });
}




// ===================================
// PIPELINE — DUAL-ROW DOM BUILDER
// ===================================
function buildPipelineDOM(modelType = 'denoising') {
    const root = document.getElementById('pipelineFlow');
    if (!root) return;
    root.innerHTML = '';
    root.classList.add('pipeline-idle');

    let inputSrc = '../notebook/images/level3_noise_0.5_input.png';
    let outputSrc = '../notebook/images/level3_noise_0.5_reconstructed.png';
    if (modelType === 'basic') {
        inputSrc = '../notebook/images/original.png';
        outputSrc = '../notebook/images/level1_noise_0.1_reconstructed.png';
    }

    const pgrid = document.createElement('div');
    pgrid.className = 'pgrid';

    // --- ROW 1: ENCODER ---
    const inWrap = document.createElement('div');
    inWrap.className = 'pgrid-in';
    inWrap.appendChild(buildImgNode('pipe-img-input', inputSrc, 'Input Image', 'img-initial'));
    inWrap.appendChild(buildArrow('arr-enc-in'));
    pgrid.appendChild(inWrap);

    const encBlock = document.createElement('div');
    encBlock.className = 'pgrid-block pgrid-enc';
    ENCODER_LAYERS.forEach((size, i) => {
        if (i > 0) encBlock.appendChild(buildArrow(`arr-enc-${i}`));
        const isInput = i === 0;
        const isLatent = i === ENCODER_LAYERS.length - 1;
        const color = isInput ? 'green' : isLatent ? 'red' : 'blue';
        const tip = isInput
            ? `Input: ${size} neurons\n28×28 image flattened\nNo activation`
            : isLatent
                ? `Latent Layer: ${size} neurons\nFull compression\nSigmoid activation`
                : `Hidden: ${size} neurons\nReLU + BatchNorm${i === 1 ? '\nDropout(0.1)' : ''}`;
        encBlock.appendChild(buildLayerNode(`enc-${i}`, size, color, tip));
    });
    pgrid.appendChild(encBlock);

    // --- ROW 2: CENTER BLOCK ---
    const centerBlock = document.createElement('div');
    centerBlock.className = 'pgrid-center-block';

    // Vertical flow logic
    const bridgeFlow = document.createElement('div');
    bridgeFlow.style.display = 'flex';
    bridgeFlow.style.flexDirection = 'column';
    bridgeFlow.style.alignItems = 'center';

    const arrEnc = document.createElement('div');
    arrEnc.id = 'arr-bridge-in';
    arrEnc.className = 'parr';
    arrEnc.style.transform = 'rotate(90deg)';
    arrEnc.style.margin = '8px 0';
    arrEnc.innerHTML = `<svg viewBox="0 0 28 10" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="5" x2="22" y2="5" stroke="currentColor" stroke-width="1.5"/><polygon points="19,1.5 28,5 19,8.5" fill="currentColor"/></svg>`;
    bridgeFlow.appendChild(arrEnc);

    const latentCard = document.createElement('div');
    latentCard.id = 'pipe-latent';
    latentCard.className = 'pdual-latent-card';
    latentCard.dataset.tip = '2D Latent Space\nBottleneck: 784 → 2\nSigmoid activation\nEntire image encoded in 2 numbers';
    latentCard.innerHTML = `
        <span class="pdual-lat-title">Latent Space</span>
        <div class="pnode pnode--red" id="pipe-latent-node">2</div>
        <span class="pdual-lat-sub" id="pipe-lat-hint">Waiting for input...</span>
    `;
    bridgeFlow.appendChild(latentCard);

    const arrDec = document.createElement('div');
    arrDec.id = 'arr-bridge-out';
    arrDec.className = 'parr';
    arrDec.style.transform = 'rotate(90deg)';
    arrDec.style.margin = '8px 0';
    arrDec.innerHTML = `<svg viewBox="0 0 28 10" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="5" x2="22" y2="5" stroke="currentColor" stroke-width="1.5"/><polygon points="19,1.5 28,5 19,8.5" fill="currentColor"/></svg>`;
    bridgeFlow.appendChild(arrDec);

    centerBlock.appendChild(bridgeFlow);

    // Live Data Monitor
    const livePanel = document.createElement('div');
    livePanel.id = 'live-data-panel';
    livePanel.className = 'live-data-panel';
    livePanel.innerHTML = `
        <div class="live-data-title">Current Transformation</div>
        <canvas id="live-data-canvas" width="28" height="28"></canvas>
    `;
    centerBlock.appendChild(livePanel);
    pgrid.appendChild(centerBlock);

    // --- ROW 3: DECODER ---
    const decBlock = document.createElement('div');
    decBlock.className = 'pgrid-block pgrid-dec';
    DECODER_LAYERS.forEach((size, i) => {
        if (i > 0) decBlock.appendChild(buildArrow(`arr-dec-${i}`));
        const isLatent = i === 0;
        const isOutput = i === DECODER_LAYERS.length - 1;
        const color = isOutput ? 'green' : isLatent ? 'red' : 'blue';
        const tip = isOutput
            ? `Output: ${size} neurons\nReshapes to 28×28\nSigmoid activation`
            : isLatent
                ? `Latent Layer: ${size} neurons\nReconstruction begins here`
                : `Hidden: ${size} neurons\nReLU + BatchNorm`;
        decBlock.appendChild(buildLayerNode(`dec-${i}`, size, color, tip));
    });
    pgrid.appendChild(decBlock);

    const outWrap = document.createElement('div');
    outWrap.className = 'pgrid-out';
    outWrap.appendChild(buildArrow('arr-dec-out'));
    outWrap.appendChild(buildImgNode('pipe-img-output', outputSrc, 'Reconstructed', 'img-idle'));
    pgrid.appendChild(outWrap);

    root.appendChild(pgrid);

    generateAnimationSteps();
    initLiveDataTransformations(inputSrc, outputSrc, modelType);
}

const PRECOMPUTED_FRAMES = {};

function downscaleImage(image, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, image.width || 28, image.height || 28, 0, 0, size, size);
    return canvas;
}

function upscaleImage(image, size, smoothing) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = smoothing;
    ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, size, size);
    return canvas;
}

function initLiveDataTransformations(inputSrc, outputSrc, modelType) {
    const srcImg = new Image();
    srcImg.crossOrigin = "Anonymous";
    srcImg.src = inputSrc;
    srcImg.onload = () => {
        const reconImg = new Image();
        reconImg.crossOrigin = "Anonymous";
        reconImg.src = outputSrc;
        reconImg.onload = () => {
            // Encoder resolution steps (MUST NOT CHANGE)
            const encResolutions = [28, 22, 16, 11, 8, 5, 4, 3, 2, 2];

            // Decoder resolution steps = encoder steps in reverse (forward playback = decompression)
            // enc: 28→22→16→11→8→5→4→3→2→2  →  latent = 2x2
            // dec playback: 2→2→3→4→5→8→11→16→22→RECON
            const decResolutions = [2, 2, 3, 4, 5, 8, 11, 16, 22, 'RECON'];

            const srcCanvas = document.createElement('canvas');
            srcCanvas.width = 28; srcCanvas.height = 28;
            const ctxSrc = srcCanvas.getContext('2d');
            ctxSrc.drawImage(srcImg, 0, 0, 28, 28);

            const reconCanvas = document.createElement('canvas');
            reconCanvas.width = 28; reconCanvas.height = 28;
            const ctxRecon = reconCanvas.getContext('2d');
            ctxRecon.drawImage(reconImg, 0, 0, 28, 28);

            // =============================================
            // ENCODER PASS — pixel downscaling (UNCHANGED)
            // =============================================
            encResolutions.forEach((res, i) => {
                const id = `enc-${i}`;

                const smallCanvas = downscaleImage(srcCanvas, res);
                const ctxSmall = smallCanvas.getContext('2d');

                const depth = 28 - res;
                const noiseIntensity = depth * 3.5;
                if (noiseIntensity > 0) {
                    const imgData = ctxSmall.getImageData(0, 0, res, res);
                    const data = imgData.data;
                    for (let j = 0; j < data.length; j += 4) {
                        if (data[j + 3] > 0) {
                            const noise = (Math.random() - 0.5) * noiseIntensity;
                            data[j]     = Math.min(255, Math.max(0, data[j]     + noise));
                            data[j + 1] = Math.min(255, Math.max(0, data[j + 1] + noise));
                            data[j + 2] = Math.min(255, Math.max(0, data[j + 2] + noise));
                        }
                    }
                    ctxSmall.putImageData(imgData, 0, 0);
                }

                // Nearest-neighbor upscale to display size (blocky)
                PRECOMPUTED_FRAMES[id] = upscaleImage(smallCanvas, 28, false).toDataURL();
            });

            // Latent bridge
            PRECOMPUTED_FRAMES['pipe-latent'] = PRECOMPUTED_FRAMES['enc-9'];

            // =============================================
            // DECODER PASS — precompute frames by applying
            // encoder's compression pipeline to reconCanvas,
            // then play forward (most compressed → full)
            // =============================================
            decResolutions.forEach((res, i) => {
                const id = `dec-${i}`;

                if (res === 'RECON') {
                    // Final frame = actual reconstructed image
                    PRECOMPUTED_FRAMES[id] = reconCanvas.toDataURL();
                    return;
                }

                // Apply SAME downscale logic as encoder, but on the reconstructed image
                const smallCanvas = downscaleImage(reconCanvas, res);

                // Upscale to display size:
                // - Early steps (low res): no smoothing → blocky look
                // - Later steps (high res): slight smoothing → cleaner look
                const smoothing = res > 8;
                PRECOMPUTED_FRAMES[id] = upscaleImage(smallCanvas, 28, smoothing).toDataURL();
            });

            // dec-0 must visually match latent (both are 2x2 view)
            PRECOMPUTED_FRAMES['dec-0'] = PRECOMPUTED_FRAMES['enc-9'];

            // Console validation
            console.log("Latent Sync Verifier:", {
                encToLatent:  PRECOMPUTED_FRAMES['enc-9'] === PRECOMPUTED_FRAMES['pipe-latent'],
                latentToDec0: PRECOMPUTED_FRAMES['dec-0'] === PRECOMPUTED_FRAMES['enc-9']
            });
        };
    };
}

function buildLayerNode(id, size, color, tip) {
    const el = document.createElement('div');
    el.id = id;
    el.className = `pnode pnode--${color}`;
    el.dataset.tip = tip;
    el.textContent = size;
    return el;
}

function buildArrow(id = null) {
    const el = document.createElement('div');
    el.className = 'parr';
    if (id) el.id = id;
    el.innerHTML = `<svg viewBox="0 0 28 10" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="5" x2="22" y2="5" stroke="currentColor" stroke-width="1.5"/>
        <polygon points="19,1.5 28,5 19,8.5" fill="currentColor"/>
    </svg>`;
    return el;
}

function buildImgNode(id, src, label, initialClass = 'img-hidden') {
    const wrap = document.createElement('div');
    wrap.id = id + '-wrap';
    wrap.className = `pimg-wrap ${initialClass}`;
    wrap.innerHTML = `
        <span class="pimg-lbl">${label}</span>
        <div class="pimg-frame">
            <img id="${id}" src="${src}" alt="${label}">
        </div>`;
    return wrap;
}

// ===================================
// PIPELINE ANIMATION
// ===================================
let _prevId = null;
let _prevFlowId = null;

function initializePipelineControls() {
    document.getElementById('startAnimation')?.addEventListener('click', () => {
        if (!state.isAnimating) runPipelineAnimation();
    });
    document.getElementById('resetAnimation')?.addEventListener('click', resetPipeline);
    
    const modelSelect = document.getElementById('pipelineModelSelect');
    if (modelSelect) {
        modelSelect.addEventListener('change', (e) => {
            if (state.isAnimating) resetPipeline();
            buildPipelineDOM(e.target.value);
        });
    }
}

function resetPipeline() {
    state.isAnimating = false;
    _prevId = null;
    _prevFlowId = null;

    const liveCanvas = document.getElementById('live-data-canvas');
    if (liveCanvas) {
        liveCanvas.getContext('2d').clearRect(0, 0, 28, 28);
    }

    const liveP = document.getElementById('live-data-panel');
    if (liveP) liveP.classList.remove('panel-active');

    const flowObj = document.getElementById('pipelineFlow');
    if (flowObj) flowObj.classList.add('pipeline-idle');

    const latHint = document.getElementById('pipe-lat-hint');
    if (latHint) latHint.textContent = 'Waiting for input...';

    const inWrap = document.getElementById('pipe-img-input-wrap');
    if (inWrap) inWrap.className = 'pimg-wrap img-initial';

    const outWrap = document.getElementById('pipe-img-output-wrap');
    if (outWrap) outWrap.className = 'pimg-wrap img-idle';

    document.querySelectorAll('.pnode, .pdual-latent-card').forEach(el => {
        el.classList.remove('layer-active', 'layer-done');
    });
    document.querySelectorAll('.parr, .pdual-vert-conn').forEach(el => {
        el.classList.remove('arrow-active');
    });
    const btn = document.getElementById('startAnimation');
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Start to visualize flow`;
    }
}

async function runPipelineAnimation() {
    if (state.isAnimating) return;
    state.isAnimating = true;
    _prevId = null;
    _prevFlowId = null;
    const btn = document.getElementById('startAnimation');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Animating…'; }

    const flowObj = document.getElementById('pipelineFlow');
    if (flowObj) flowObj.classList.remove('pipeline-idle');

    const latHint = document.getElementById('pipe-lat-hint');
    if (latHint) latHint.textContent = '2D Bottleneck · 784 → 2 dimensions';

    for (const step of ANIM_STEPS) {
        if (!state.isAnimating) break;
        if (step.action === 'showImg') {
            const el = document.getElementById(step.id);
            if (el) {
                el.classList.remove('img-hidden', 'img-processing', 'img-idle', 'img-initial');
                el.classList.add('img-visible');

                if (step.id === 'pipe-img-output-wrap' && PRECOMPUTED_FRAMES['dec-9']) {
                    const outImg = document.getElementById('pipe-img-output');
                    if (outImg) outImg.src = PRECOMPUTED_FRAMES['dec-9'];
                }
            }
        } else if (step.action === 'processing') {
            const el = document.getElementById(step.id);
            if (el) { el.classList.add('img-processing'); el.classList.remove('img-hidden', 'img-idle', 'img-initial'); }
            await sleep(150);
        } else if (step.action === 'flow') {
            if (_prevId) {
                const prev = document.getElementById(_prevId);
                if (prev) { prev.classList.remove('layer-active'); prev.classList.add('layer-done'); }
                _prevId = null;
            }
            if (_prevFlowId) {
                const prevFl = document.getElementById(_prevFlowId);
                if (prevFl) prevFl.classList.remove('arrow-active');
            }
            const el = document.getElementById(step.id);
            if (el) el.classList.add('arrow-active');
            _prevFlowId = step.id;
            await sleep(140);
        } else if (step.action === 'activate') {
            if (_prevId) {
                const prev = document.getElementById(_prevId);
                if (prev) { prev.classList.remove('layer-active'); prev.classList.add('layer-done'); }
            }
            if (_prevFlowId) {
                const prevFl = document.getElementById(_prevFlowId);
                if (prevFl) prevFl.classList.remove('arrow-active');
                _prevFlowId = null;
            }
            const el = document.getElementById(step.id);
            if (el) el.classList.add('layer-active');
            _prevId = step.id;

            const frameUrl = PRECOMPUTED_FRAMES[step.id];
            if (frameUrl) {
                const liveP = document.getElementById('live-data-panel');
                if (liveP) liveP.classList.add('panel-active');

                const liveCanvas = document.getElementById('live-data-canvas');
                if (liveCanvas) {
                    const ctxLv = liveCanvas.getContext('2d');
                    const imgObj = new Image();
                    imgObj.onload = () => {
                        ctxLv.clearRect(0, 0, 28, 28);
                        ctxLv.drawImage(imgObj, 0, 0, 28, 28);
                    };
                    imgObj.src = frameUrl;
                }
            }

            await sleep(step.delay || 300);
        }
    }

    if (_prevId) {
        const last = document.getElementById(_prevId);
        if (last) { last.classList.remove('layer-active'); last.classList.add('layer-done'); }
    }

    state.isAnimating = false;
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Play Again`;
    }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
