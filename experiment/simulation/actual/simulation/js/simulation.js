// ===================================
// GLOBAL STATE
// ===================================
const state = {
    currentTab: 'denoising',
    currentClass: 'boot',
    currentNoise: 0.3,
    isAnimating: false
};

// Available noise levels (matching notebook)
const NOISE_LEVELS = [0.1, 0.3, 0.5, 0.7, 0.9];

// Architecture layers (from notebook Step 3)
const ENCODER_LAYERS = [784, 512, 256, 128, 64, 32, 16, 8, 4, 2];
const DECODER_LAYERS = [2, 4, 8, 16, 32, 64, 128, 256, 512, 784];

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeDenoisingControls();
    initializePipelineAnimation();
});

// ===================================
// TAB MANAGEMENT
// ===================================
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            state.currentTab = tabId;

            // Update button states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update content visibility
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// ===================================
// DENOISING TAB (NOTEBOOK-IDENTICAL)
// ===================================
function initializeDenoisingControls() {
    const classSelector = document.getElementById('classSelector');
    const noiseSlider = document.getElementById('noiseSlider');
    const noiseValue = document.getElementById('noiseValue');

    // Class selection
    if (classSelector) {
        classSelector.value = state.currentClass;
        classSelector.addEventListener('change', (e) => {
            state.currentClass = e.target.value;
            updateNoiseImages(state.currentNoise, state.currentClass);
        });
    }

    // Noise slider (exact logic from notebook)
    if (noiseSlider && noiseValue) {
        noiseSlider.value = state.currentNoise * 100;
        noiseValue.textContent = state.currentNoise.toFixed(2);

        // Update display in real-time while dragging (smooth)
        noiseSlider.addEventListener('input', (e) => {
            const rawValue = e.target.value / 100;
            noiseValue.textContent = rawValue.toFixed(2);
        });

        // Snap to nearest discrete level on release and update images
        noiseSlider.addEventListener('change', (e) => {
            const rawValue = e.target.value / 100;
            const snappedValue = snapToNearestNoiseLevel(rawValue);
            e.target.value = snappedValue * 100;
            noiseValue.textContent = snappedValue.toFixed(2);
            state.currentNoise = snappedValue;
            updateNoiseImages(snappedValue, state.currentClass);
        });
    }

    // Set initial images
    updateNoiseImages(state.currentNoise, state.currentClass);
}

// Snap to nearest noise level (from notebook script.js)
function snapToNearestNoiseLevel(value) {
    let closest = NOISE_LEVELS[0];
    let minDiff = Math.abs(value - closest);

    for (let level of NOISE_LEVELS) {
        const diff = Math.abs(value - level);
        if (diff < minDiff) {
            minDiff = diff;
            closest = level;
        }
    }
    return closest;
}

// Update images based on noise and class (from notebook script.js lines 753-812)
function updateNoiseImages(noiseLevel, selectedClass = 'boot') {
    const noisyImage = document.getElementById('noisyImage');
    const reconstructedImage = document.getElementById('reconstructedImage');
    const originalImage = document.getElementById('originalImage');

    if (!noisyImage || !reconstructedImage) return;

    // Map noise level to image level (1-5)
    let level;
    let levelNumber;

    if (noiseLevel <= 0.2) {
        level = '0.1';
        levelNumber = 1;
    } else if (noiseLevel <= 0.4) {
        level = '0.3';
        levelNumber = 2;
    } else if (noiseLevel <= 0.6) {
        level = '0.5';
        levelNumber = 3;
    } else if (noiseLevel <= 0.8) {
        level = '0.7';
        levelNumber = 4;
    } else {
        level = '0.9';
        levelNumber = 5;
    }

    // Update images based on selected class (exact logic from notebook)
    if (selectedClass === 'trouser') {
        // Trouser class images
        if (originalImage) {
            originalImage.src = '../notebook/images/img3_Trouser_original.png';
        }
        noisyImage.src = `../notebook/images/img3_Trouser_L${levelNumber}_noise${level}_input.png`;
        reconstructedImage.src = `../notebook/images/img3_Trouser_L${levelNumber}_noise${level}_output.png`;
    } else if (selectedClass === 'shirt') {
        // Shirt class images
        if (originalImage) {
            originalImage.src = '../notebook/images/original_idx_7.png';
        }
        // Handle level 5 which has a space in filename
        if (levelNumber === 5) {
            noisyImage.src = '../notebook/images/level5_noise_0.9_input shirt.png';
            reconstructedImage.src = '../notebook/images/level5_noise_0.9_reconstructed_shirt.png';
        } else {
            noisyImage.src = `../notebook/images/level${levelNumber}_noise_${level}_inputshirt.png`;
            reconstructedImage.src = `../notebook/images/level${levelNumber}_noise_${level}_reconstructedshirt.png`;
        }
    } else {
        // Ankle boot class images (default)
        if (originalImage) {
            originalImage.src = '../notebook/images/original.png';
        }
        noisyImage.src = `../notebook/images/level${levelNumber}_noise_${level}_input.png`;
        reconstructedImage.src = `../notebook/images/level${levelNumber}_noise_${level}_reconstructed.png`;
    }
}

// ===================================
// PIPELINE TAB (ANIMATED ARCHITECTURE)
// ===================================
function initializePipelineAnimation() {
    const startBtn = document.getElementById('startAnimation');
    const resetBtn = document.getElementById('resetAnimation');
    const canvas = document.getElementById('pipelineCanvas');

    if (!canvas) return;

    // Draw initial architecture
    drawPipelineArchitecture(canvas);

    // Start animation button
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (!state.isAnimating) {
                animatePipeline(canvas);
            }
        });
    }

    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            state.isAnimating = false;
            drawPipelineArchitecture(canvas);
        });
    }
}

// Draw the architecture diagram (based on notebook drawArchitectureDiagram)
function drawPipelineArchitecture(canvas, highlightIndex = -1, stage = null) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Layout parameters
    const startX = 60;
    const boxWidth = 70;
    const boxHeight = 40;
    const spacing = 12;
    const encoderY = 150;
    const decoderY = 400;

    // Draw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 20px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Autoencoder Architecture: Layer-by-Layer Data Flow', width / 2, 40);

    // Helper function to draw a box
    function drawBox(x, y, text, isLatent = false, isInput = false, isOutput = false, isHighlighted = false) {
        // Box color
        let fillColor = '#0d6efd'; // Hidden layers (blue)
        if (isLatent) fillColor = '#dc3545'; // Latent (red)
        if (isInput || isOutput) fillColor = '#198754'; // Input/Output (green)
        if (isHighlighted) fillColor = '#ffc107'; // Highlighted (yellow)

        ctx.fillStyle = fillColor;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = isHighlighted ? 3 : 2;

        ctx.beginPath();
        ctx.roundRect(x, y, boxWidth, boxHeight, 5);
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + boxWidth / 2, y + boxHeight / 2);
    }

    // Helper function to draw arrow
    function drawArrow(x1, y1, x2, y2, isHighlighted = false) {
        ctx.strokeStyle = isHighlighted ? '#ffc107' : '#666';
        ctx.lineWidth = isHighlighted ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 10;
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
            x2 - headLength * Math.cos(angle - Math.PI / 6),
            y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(x2, y2);
        ctx.lineTo(
            x2 - headLength * Math.cos(angle + Math.PI / 6),
            y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
    }

    // Draw label
    function drawLabel(x, y, text) {
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Inter, Arial';
        ctx.textAlign = 'left';
        ctx.fillText(text, x, y);
    }

    // Draw encoder label
    drawLabel(startX, encoderY - 40, 'Encoder (Compression)');

    // Draw encoder layers
    ENCODER_LAYERS.forEach((size, idx) => {
        const x = startX + idx * (boxWidth + spacing);
        const isInput = idx === 0;
        const isLatent = idx === ENCODER_LAYERS.length - 1;
        const isHighlighted = (stage === 'encoder' && idx === highlightIndex);

        drawBox(x, encoderY, size.toString(), isLatent, isInput, false, isHighlighted);

        // Draw arrow to next box
        if (idx < ENCODER_LAYERS.length - 1) {
            const arrowHighlighted = (stage === 'encoder' && idx === highlightIndex);
            drawArrow(
                x + boxWidth,
                encoderY + boxHeight / 2,
                x + boxWidth + spacing,
                encoderY + boxHeight / 2,
                arrowHighlighted
            );
        }
    });

    // Draw decoder label
    drawLabel(startX, decoderY - 40, 'Decoder (Reconstruction)');

    // Draw decoder layers
    DECODER_LAYERS.forEach((size, idx) => {
        const x = startX + idx * (boxWidth + spacing);
        const isLatent = idx === 0;
        const isOutput = idx === DECODER_LAYERS.length - 1;
        const isHighlighted = (stage === 'decoder' && idx === highlightIndex);

        drawBox(x, decoderY, size.toString(), isLatent, false, isOutput, isHighlighted);

        // Draw arrow to next box
        if (idx < DECODER_LAYERS.length - 1) {
            const arrowHighlighted = (stage === 'decoder' && idx === highlightIndex);
            drawArrow(
                x + boxWidth,
                decoderY + boxHeight / 2,
                x + boxWidth + spacing,
                decoderY + boxHeight / 2,
                arrowHighlighted
            );
        }
    });

    // Draw input and output images on the right side
    const imageX = width - 180;
    const imageSize = 120;
    const imageSpacing = 40;

    // Input image
    const inputY = 120;
    ctx.fillStyle = '#333';
    ctx.font = '12px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Input', imageX + imageSize / 2, inputY - 10);

    ctx.strokeStyle = '#198754';
    ctx.lineWidth = 2;
    ctx.strokeRect(imageX, inputY, imageSize, imageSize);

    const inputImg = document.getElementById('originalImage');
    if (inputImg && inputImg.complete) {
        ctx.drawImage(inputImg, imageX, inputY, imageSize, imageSize);
    }

    // Reconstructed image
    const outputY = inputY + imageSize + imageSpacing;
    ctx.fillStyle = '#333';
    ctx.fillText('Reconstructed', imageX + imageSize / 2, outputY - 10);

    ctx.strokeStyle = '#198754';
    ctx.lineWidth = 2;
    ctx.strokeRect(imageX, outputY, imageSize, imageSize);

    const outputImg = document.getElementById('reconstructedImage');
    if (outputImg && outputImg.complete) {
        ctx.drawImage(outputImg, imageX, outputY, imageSize, imageSize);
    }

    // Add legend
    const legendY = height - 60;
    const legendX = 60;

    // Input/Output box
    ctx.fillStyle = '#198754';
    ctx.fillRect(legendX, legendY, 25, 18);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, 25, 18);
    ctx.fillStyle = '#333';
    ctx.font = '13px Inter, Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Input/Output', legendX + 35, legendY + 14);

    // Hidden layer box
    ctx.fillStyle = '#0d6efd';
    ctx.fillRect(legendX + 200, legendY, 25, 18);
    ctx.strokeRect(legendX + 200, legendY, 25, 18);
    ctx.fillText('Hidden Layers', legendX + 235, legendY + 14);

    // Latent space box
    ctx.fillStyle = '#dc3545';
    ctx.fillRect(legendX + 400, legendY, 25, 18);
    ctx.strokeRect(legendX + 400, legendY, 25, 18);
    ctx.fillText('Latent Space', legendX + 435, legendY + 14);

    // Active layer
    ctx.fillStyle = '#ffc107';
    ctx.fillRect(legendX + 600, legendY, 25, 18);
    ctx.strokeRect(legendX + 600, legendY, 25, 18);
    ctx.fillText('Active Layer', legendX + 635, legendY + 14);

    // Add note
    ctx.fillStyle = '#666';
    ctx.font = 'italic 12px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Note: BatchNorm and ReLU activation applied after each layer. Dropout(0.1) after first encoder layer.', width / 2, height - 25);
}

// Animate the pipeline
async function animatePipeline(canvas) {
    if (state.isAnimating) return;
    state.isAnimating = true;

    const startBtn = document.getElementById('startAnimation');
    if (startBtn) {
        startBtn.disabled = true;
        startBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.3"/></svg> Animating...';
    }

    // Animate encoder
    for (let i = 0; i < ENCODER_LAYERS.length; i++) {
        if (!state.isAnimating) break;
        drawPipelineArchitecture(canvas, i, 'encoder');
        await sleep(400);
    }

    // Pause at latent space
    if (state.isAnimating) {
        drawPipelineArchitecture(canvas, -1, 'latent');
        await sleep(800);
    }

    // Animate decoder
    for (let i = 0; i < DECODER_LAYERS.length; i++) {
        if (!state.isAnimating) break;
        drawPipelineArchitecture(canvas, i, 'decoder');
        await sleep(400);
    }

    // Reset to normal
    if (state.isAnimating) {
        drawPipelineArchitecture(canvas);
    }

    state.isAnimating = false;
    if (startBtn) {
        startBtn.disabled = false;
        startBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg> Start Animation';
    }
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// CanvasRenderingContext2D.roundRect polyfill for older browsers
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
        return this;
    };
}
