// ===================================
// GLOBAL STATE MANAGEMENT
// ===================================
const appState = {
    completedSteps: [],
    currentStep: 1,
    maxUnlockedStep: 1,
    trainingData: {
        epochs: [],
        losses: []
    },
    isRunningAll: false
};

// FashionMNIST class names
const FASHION_CLASSES = [
    'T-shirt/top', 'Trouser', 'Pullover', 'Dress', 'Coat',
    'Sandal', 'Shirt', 'Sneaker', 'Bag', 'Ankle boot'
];

// Training loss data (simulated from the notebook results)
const TRAINING_LOSSES = [
    0.0542, 0.0542, 0.0542, 0.0542, 0.0542, // Epochs 1-5
    0.0520, 0.0520, 0.0520, 0.0520, 0.0520, // Epochs 6-10
    0.0518, 0.0518, 0.0518, 0.0518, 0.0518, // Epochs 11-15
    0.0502, 0.0502, 0.0502, 0.0502, 0.0502, // Epochs 16-20
    0.0487, 0.0487, 0.0487, 0.0487, 0.0487, // Epochs 21-25
    0.0477, 0.0477, 0.0477, 0.0477, 0.0477, // Epochs 26-30
    0.0467, 0.0467, 0.0467, 0.0467, 0.0467, // Epochs 31-35
    0.0461, 0.0461, 0.0461, 0.0461, 0.0461, // Epochs 36-40
    0.0442, 0.0442, 0.0442, 0.0442, 0.0442, // Epochs 41-45
    0.0467, 0.0467, 0.0467, 0.0467, 0.0467, // Epochs 46-50
    0.0482, 0.0482, 0.0482, 0.0482, 0.0482, // Epochs 51-55
    0.0461, 0.0461, 0.0461, 0.0461, 0.0461, // Epochs 56-60
    0.0458, 0.0458, 0.0458, 0.0458, 0.0458, // Epochs 61-65
    0.0457, 0.0457, 0.0457, 0.0457, 0.0457, // Epochs 66-70
    0.0455, 0.0455, 0.0455, 0.0455, 0.0455, // Epochs 71-75
    0.0450, 0.0450, 0.0450, 0.0450, 0.0450, // Epochs 76-80
    0.0459, 0.0459, 0.0459, 0.0459, 0.0459, // Epochs 81-85
    0.0448, 0.0448, 0.0448, 0.0448, 0.0448, // Epochs 86-90
    0.0447, 0.0447, 0.0447, 0.0447, 0.0447, // Epochs 91-95
    0.0445, 0.0445, 0.0445, 0.0445, 0.0445  // Epochs 96-100
];

// ===================================
// INITIALIZATION
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    applyReferenceLayout();
    // Small delay to ensure DOM is updated after layout transformation
    setTimeout(() => {
        setupRunButtons();
        updateStepButtons();
        initializeScrolling();
        setupNoiseControl();
        populateLegend();
        initializeSidebarActions();
    }, 100);
});

// ===================================
// LAYOUT & NAVIGATION
// ===================================
function applyReferenceLayout() {
    const steps = document.querySelectorAll('.step-content');

    steps.forEach(step => {
        const stepId = step.id;
        const stepNum = stepId.split('-')[1];

        // Find title from sidebar
        const sidebarItem = document.querySelector(`.step-item[data-step="${stepNum}"]`);
        const titleText = sidebarItem.querySelector('.step-title').textContent.trim();

        // Create header container
        const header = document.createElement('div');
        header.className = 'notebook-cell-header';

        // Create title
        const titleDiv = document.createElement('div');
        titleDiv.className = 'notebook-cell-title';
        titleDiv.textContent = `Step ${stepNum}: ${titleText}`;

        // Move run button to header
        const runBtn = step.querySelector('.run-btn');
        if (runBtn) {
            header.appendChild(titleDiv);
            header.appendChild(runBtn);
        } else {
            header.appendChild(titleDiv);
        }

        // Insert header at top
        step.insertBefore(header, step.firstChild);

        // Add output label
        const outputBox = step.querySelector('.output-box');
        if (outputBox && !outputBox.querySelector('.output-label-styled')) {
            const label = document.createElement('div');
            label.className = 'output-label-styled';
            label.textContent = 'OUTPUT:';
            outputBox.insertBefore(label, outputBox.firstChild);
        }
    });
}

function initializeScrolling() {
    const sidebarItems = document.querySelectorAll('.step-item');

    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const stepNum = parseInt(item.dataset.step);
            const stepId = `step-${stepNum}`;
            const targetElement = document.getElementById(stepId);

            if (targetElement && (appState.completedSteps.includes(stepNum - 1) || stepNum === 1 || appState.completedSteps.includes(stepNum))) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update active state
                appState.currentStep = stepNum;
                updateStepButtons();
            }
        });
    });
}

// Scroll observer for automatic step highlighting
let isInitializing = true; // Flag to prevent observer from interfering during initialization

const scrollObserver = new IntersectionObserver((entries) => {
    // Don't update currentStep during initialization
    if (isInitializing) return;

    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const stepNum = parseInt(entry.target.id.split('-')[1]);
            appState.currentStep = stepNum;
            updateStepButtons();
        }
    });
}, { threshold: 0.5 });

function initializeScrolling() {
    document.querySelectorAll('.step-content').forEach(section => {
        scrollObserver.observe(section);
    });

    // After a short delay, enable the scroll observer
    setTimeout(() => {
        isInitializing = false;
    }, 500);
}


// ===================================
// STEP MANAGEMENT
// ===================================
function setupRunButtons() {
    // Step 1: Import Libraries
    const step1Btn = document.querySelector('#step-1 .run-btn');
    if (step1Btn) {
        step1Btn.addEventListener('click', () => runStep1());
    }

    // Step 2: Load Dataset
    const step2Btn = document.querySelector('#step-2 .run-btn');
    if (step2Btn) {
        step2Btn.addEventListener('click', () => runStep2());
    }

    // Step 3: Model Architecture
    const step3Btn = document.querySelector('#step-3 .run-btn');
    if (step3Btn) {
        step3Btn.addEventListener('click', () => runStep3());
    }

    // Step 4: Model Training
    const step4Btn = document.querySelector('#step-4 .run-btn');
    if (step4Btn) {
        step4Btn.addEventListener('click', () => runStep4());
    }

    // Step 5: Reconstruction
    const step5Btn = document.querySelector('#step-5 .run-btn');
    if (step5Btn) {
        step5Btn.addEventListener('click', () => runStep5());
    }

    // Step 6: Noise Robustness
    const step6Btn = document.querySelector('#step-6 .run-btn');
    if (step6Btn) {
        step6Btn.addEventListener('click', () => runStep6());
    }

    // Step 7: Latent Space
    const step7Btn = document.querySelector('#step-7 .run-btn');
    if (step7Btn) {
        step7Btn.addEventListener('click', () => runStep7());
    }
}

function updateStepButtons() {
    const sidebarItems = document.querySelectorAll('.step-item');
    const stepContents = document.querySelectorAll('.step-content');

    sidebarItems.forEach((item, idx) => {
        const stepNum = idx + 1;

        // Remove all state classes
        item.classList.remove('active', 'completed', 'running');

        // Add appropriate class
        if (stepNum === appState.currentStep) {
            item.classList.add('active');
        }

        if (appState.completedSteps.includes(stepNum)) {
            item.classList.add('completed');
        }
    });

    // Update step content visibility classes
    stepContents.forEach((content, idx) => {
        const stepNum = idx + 1;

        content.classList.remove('active', 'completed');

        if (stepNum === appState.currentStep) {
            content.classList.add('active');
        }

        if (appState.completedSteps.includes(stepNum)) {
            content.classList.add('completed');
        }
    });
}

function markStepComplete(stepNum) {
    if (!appState.completedSteps.includes(stepNum)) {
        appState.completedSteps.push(stepNum);
        appState.maxUnlockedStep = Math.max(appState.maxUnlockedStep, stepNum + 1);
    }

    // Make the next step active (clickable) if it exists
    const nextStep = stepNum + 1;
    const nextStepElement = document.getElementById(`step-${nextStep}`);
    if (nextStepElement && !appState.isRunningAll) {
        appState.currentStep = nextStep;
    }

    updateStepButtons();
}

function setStepRunning(stepNum) {
    const item = document.querySelector(`.step-item[data-step="${stepNum}"]`);
    if (item) {
        item.classList.add('running');
        item.classList.remove('active', 'completed');
    }
}

function setStepComplete(stepNum) {
    const item = document.querySelector(`.step-item[data-step="${stepNum}"]`);
    if (item) {
        item.classList.remove('running', 'active');
        item.classList.add('completed');
    }
}

// ===================================
// STEP IMPLEMENTATIONS
// ===================================

// Step 1: Import Libraries
function runStep1() {
    const btn = document.querySelector('#step-1 .run-btn');
    const output = document.getElementById('output-1');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(1);

    setTimeout(() => {
        output.style.display = 'block';
        btn.innerHTML = '✓ Completed';
        btn.classList.add('completed');
        btn.disabled = false;
        setStepComplete(1);
        markStepComplete(1);

        // Auto-scroll to next step only if not running all
        if (!appState.isRunningAll) {
            setTimeout(() => {
                document.getElementById('step-2').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
        }
    }, 800);
}

// Step 2: Load Dataset
function runStep2() {
    const btn = document.querySelector('#step-2 .run-btn');
    const output = document.getElementById('output-2');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(2);

    setTimeout(() => {
        // Create dataset grid
        createDatasetGrid();

        output.style.display = 'block';
        btn.innerHTML = '✓ Completed';
        btn.classList.add('completed');
        btn.disabled = false; // Re-enable button so it can be re-run if needed
        setStepComplete(2);
        markStepComplete(2);

        if (!appState.isRunningAll) {
            setTimeout(() => {
                document.getElementById('step-3').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
        }
    }, 1000);
}

function createDatasetGrid() {
    const grid = document.getElementById('sampleImages');
    if (!grid) return;

    grid.innerHTML = '';

    // Map of class index to actual image filenames
    const imageFiles = [
        'class1_T-shirt_top.png',
        'class2_Trouser.png',
        'class3_Pullover.png',
        'class4_Dress.png',
        'class5_Coat.png',
        'class6_Sandal.png',
        'class7_Shirt.png',
        'class8_Sneaker.png',
        'class9_Bag.png',
        'class10_Ankle_boot.png'
    ];

    // Create items for each class with actual images
    FASHION_CLASSES.forEach((className, idx) => {
        const item = document.createElement('div');
        item.className = 'grid-item';

        // Create image element pointing to actual file
        const img = document.createElement('img');
        img.src = `images/${imageFiles[idx]}`;
        img.alt = className;
        img.style.width = '100%';
        img.style.height = 'auto';

        const label = document.createElement('p');
        label.textContent = className;

        item.appendChild(img);
        item.appendChild(label);
        grid.appendChild(item);
    });
}

// Step 3: Model Architecture
function runStep3() {
    const btn = document.querySelector('#step-3 .run-btn');
    const output = document.getElementById('output-3');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(3);

    setTimeout(() => {
        // Draw the architecture diagram
        drawArchitectureDiagram();

        output.style.display = 'block';
        btn.innerHTML = '✓ Completed';
        btn.classList.add('completed');
        btn.disabled = false;
        setStepComplete(3);
        markStepComplete(3);

        if (!appState.isRunningAll) {
            setTimeout(() => {
                document.getElementById('step-4').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
        }
    }, 800);
}

function drawArchitectureDiagram() {
    const canvas = document.getElementById('architectureCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = 800;
    const height = canvas.height = 500;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Define layer sizes for encoder and decoder
    const encoderLayers = [784, 512, 256, 128, 64, 32, 16, 8, 4, 2];
    const decoderLayers = [2, 4, 8, 16, 32, 64, 128, 256, 512, 784];

    // Layout parameters
    const startX = 40;
    const boxWidth = 60;
    const boxHeight = 35;
    const spacing = 10;
    const encoderY = 80;
    const decoderY = 300;
    const latentY = 190;

    // Draw title
    ctx.fillStyle = '#333';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Autoencoder Architecture', width / 2, 30);

    // Helper function to draw a box
    function drawBox(x, y, text, isLatent = false, isInput = false, isOutput = false) {
        // Box
        ctx.fillStyle = isLatent ? '#dc3545' : (isInput || isOutput) ? '#198754' : '#0d6efd';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.roundRect(x, y, boxWidth, boxHeight, 5);
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + boxWidth / 2, y + boxHeight / 2);
    }

    // Helper function to draw arrow
    function drawArrow(x1, y1, x2, y2) {
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Arrow head
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 8;
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
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(text, x, y);
    }

    // Draw encoder label
    drawLabel(startX, encoderY - 30, 'Encoder (Compression)');

    // Draw encoder layers
    encoderLayers.forEach((size, idx) => {
        const x = startX + idx * (boxWidth + spacing);
        const isInput = idx === 0;
        const isLatent = idx === encoderLayers.length - 1;
        drawBox(x, encoderY, size.toString(), isLatent, isInput, false);

        // Draw arrow to next box
        if (idx < encoderLayers.length - 1) {
            drawArrow(
                x + boxWidth,
                encoderY + boxHeight / 2,
                x + boxWidth + spacing,
                encoderY + boxHeight / 2
            );
        }
    });

    // Draw latent space label and connection
    const latentX = startX + (encoderLayers.length - 1) * (boxWidth + spacing);
    drawLabel(latentX - 40, latentY, 'Latent Space (2D)');


    // Draw decoder label
    drawLabel(startX, decoderY - 30, 'Decoder (Reconstruction)');

    // Draw decoder layers
    decoderLayers.forEach((size, idx) => {
        const x = startX + idx * (boxWidth + spacing);
        const isLatent = idx === 0;
        const isOutput = idx === decoderLayers.length - 1;
        drawBox(x, decoderY, size.toString(), isLatent, false, isOutput);

        // Draw arrow to next box
        if (idx < decoderLayers.length - 1) {
            drawArrow(
                x + boxWidth,
                decoderY + boxHeight / 2,
                x + boxWidth + spacing,
                decoderY + boxHeight / 2
            );
        }
    });

    // Add legend
    const legendY = height - 60;
    const legendX = 40;

    // Input/Output box
    ctx.fillStyle = '#198754';
    ctx.fillRect(legendX, legendY, 20, 15);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, 20, 15);
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Input/Output Layers', legendX + 30, legendY + 12);

    // Hidden layer box
    ctx.fillStyle = '#0d6efd';
    ctx.fillRect(legendX + 180, legendY, 20, 15);
    ctx.strokeRect(legendX + 180, legendY, 20, 15);
    ctx.fillText('Hidden Layers', legendX + 210, legendY + 12);

    // Latent space box
    ctx.fillStyle = '#dc3545';
    ctx.fillRect(legendX + 330, legendY, 20, 15);
    ctx.strokeRect(legendX + 330, legendY, 20, 15);
    ctx.fillText('Latent Space', legendX + 360, legendY + 12);

    // Add note about BatchNorm and Dropout
    ctx.fillStyle = '#666';
    ctx.font = 'italic 11px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Note: BatchNorm and ReLU activation applied after each layer (except latent). Dropout(0.1) after first encoder layer.', width / 2, height - 25);
}

// Step 4: Model Training
function runStep4() {
    const btn = document.querySelector('#step-4 .run-btn');
    const output = document.getElementById('output-4');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(4);

    output.style.display = 'block';

    // Simulate training
    simulateTraining();
}

function simulateTraining() {
    const canvas = document.getElementById('trainingCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = 600;
    const height = canvas.height = 300;

    let currentEpoch = 0;
    const totalEpochs = 100;

    const interval = setInterval(() => {
        if (currentEpoch >= totalEpochs) {
            clearInterval(interval);

            const btn = document.querySelector('#step-4 .run-btn');
            btn.innerHTML = '✓ Completed';
            btn.classList.add('completed');
            btn.disabled = false;
            setStepComplete(4);
            markStepComplete(4);

            const statusElem = document.getElementById('trainingStatus');
            if (statusElem) {
                statusElem.textContent = `Training completed! Best Loss: ${Math.min(...TRAINING_LOSSES).toFixed(4)}`;
            }

            if (!appState.isRunningAll) {
                setTimeout(() => {
                    document.getElementById('step-5').scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 500);
            }

            return;
        }

        currentEpoch += 1; // Show each epoch individually

        // Update metrics
        document.getElementById('currentEpoch').textContent = currentEpoch;
        const lossElem = document.getElementById('lossValue');
        const bestLossElem = document.getElementById('bestLoss');

        if (lossElem) {
            lossElem.textContent = TRAINING_LOSSES[currentEpoch - 1].toFixed(4);
        }

        if (bestLossElem) {
            bestLossElem.textContent = Math.min(...TRAINING_LOSSES.slice(0, currentEpoch)).toFixed(4);
        }

        // Update status
        const statusElem = document.getElementById('trainingStatus');
        if (statusElem) {
            statusElem.textContent = `Epoch [${currentEpoch}/${totalEpochs}] Loss: ${TRAINING_LOSSES[currentEpoch - 1].toFixed(4)}`;
        }

        // Draw training curve
        drawTrainingCurve(ctx, width, height, currentEpoch);

    }, 50); // Small delay for smooth animation
}

function drawTrainingCurve(ctx, width, height, currentEpoch) {
    // Clear canvas
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    // Draw axes
    const padding = 40;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Epoch', width / 2, height - 10);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Loss', 0, 0);
    ctx.restore();

    // Draw loss curve
    const minLoss = Math.min(...TRAINING_LOSSES);
    const maxLoss = Math.max(...TRAINING_LOSSES);
    const lossRange = maxLoss - minLoss;

    ctx.strokeStyle = '#0d6efd';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i < currentEpoch; i++) {
        const x = padding + (i / 100) * graphWidth;
        const y = height - padding - ((TRAINING_LOSSES[i] - minLoss) / lossRange) * graphHeight;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }

    ctx.stroke();

    // Draw current point
    const lastX = padding + ((currentEpoch - 1) / 100) * graphWidth;
    const lastY = height - padding - ((TRAINING_LOSSES[currentEpoch - 1] - minLoss) / lossRange) * graphHeight;

    ctx.fillStyle = '#198754';
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fill();
}

// Step 5: Reconstruction Results
function runStep5() {
    const btn = document.querySelector('#step-5 .run-btn');
    const output = document.getElementById('output-5');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(5);

    setTimeout(() => {
        output.style.display = 'block';
        btn.innerHTML = '✓ Completed';
        btn.classList.add('completed');
        setStepComplete(5);
        markStepComplete(5);

        if (!appState.isRunningAll) {
            setTimeout(() => {
                document.getElementById('step-6').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
        }
    }, 1000);
}

// Step 6: Noise Robustness
function runStep6() {
    const btn = document.querySelector('#step-6 .run-btn');
    const output = document.getElementById('output-6');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(6);

    setTimeout(() => {
        output.style.display = 'block';
        btn.innerHTML = '✓ Completed';
        btn.classList.add('completed');
        setStepComplete(6);
        markStepComplete(6);

        if (!appState.isRunningAll) {
            setTimeout(() => {
                document.getElementById('step-7').scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
        }
    }, 1000);
}

function setupNoiseControl() {
    const slider = document.getElementById('noiseSlider');
    const valueDisplay = document.getElementById('noiseValue');
    const classSelector = document.getElementById('classSelector');

    // Available discrete noise levels
    const noiseLevels = [0.1, 0.3, 0.5, 0.7, 0.9];

    // Function to snap value to nearest discrete level
    function snapToNearestLevel(value) {
        let closest = noiseLevels[0];
        let minDiff = Math.abs(value - closest);

        for (let level of noiseLevels) {
            const diff = Math.abs(value - level);
            if (diff < minDiff) {
                minDiff = diff;
                closest = level;
            }
        }
        return closest;
    }

    if (slider && valueDisplay) {
        // Update images in real-time as slider moves
        slider.addEventListener('input', (e) => {
            const rawValue = e.target.value / 100;
            const value = snapToNearestLevel(rawValue);
            valueDisplay.textContent = value.toFixed(2);
            const selectedClass = classSelector ? classSelector.value : 'boot';
            updateNoiseImages(value, selectedClass);
        });

        // Snap to nearest level when mouse is released
        slider.addEventListener('change', (e) => {
            const rawValue = e.target.value / 100;
            const snappedValue = snapToNearestLevel(rawValue);
            // Update slider position to snapped value
            e.target.value = snappedValue * 100;
            valueDisplay.textContent = snappedValue.toFixed(2);
            const selectedClass = classSelector ? classSelector.value : 'boot';
            updateNoiseImages(snappedValue, selectedClass);
        });

        // Set initial images
        updateNoiseImages(0.3, 'boot');
        slider.value = 30; // Set to 0.3 initially
        valueDisplay.textContent = '0.30';
    }

    // Handle class selection change
    if (classSelector) {
        classSelector.addEventListener('change', (e) => {
            const rawValue = slider ? slider.value / 100 : 0.3;
            const noiseLevel = snapToNearestLevel(rawValue);
            updateNoiseImages(noiseLevel, e.target.value);
        });
    }
}

function updateNoiseImages(noiseLevel, selectedClass = 'boot') {
    const noisyImage = document.getElementById('noisyImage');
    const reconstructedImage = document.getElementById('reconstructedImage');
    const originalImage = document.getElementById('originalImage');

    if (!noisyImage || !reconstructedImage) return;

    // Map noise level to available image levels
    // Available levels: 0.1, 0.3, 0.5, 0.7, 0.9
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

    // Update images based on selected class
    if (selectedClass === 'trouser') {
        // Trouser class images
        if (originalImage) {
            originalImage.src = 'images/img3_Trouser_original.png';
        }
        noisyImage.src = `images/img3_Trouser_L${levelNumber}_noise${level}_input.png`;
        reconstructedImage.src = `images/img3_Trouser_L${levelNumber}_noise${level}_output.png`;
    } else if (selectedClass === 'shirt') {
        // Shirt class images
        if (originalImage) {
            originalImage.src = 'images/original_idx_7.png';
        }
        // Handle level 5 which has a space in filename
        if (levelNumber === 5) {
            noisyImage.src = 'images/level5_noise_0.9_input shirt.png';
            reconstructedImage.src = 'images/level5_noise_0.9_reconstructed_shirt.png';
        } else {
            noisyImage.src = `images/level${levelNumber}_noise_${level}_inputshirt.png`;
            reconstructedImage.src = `images/level${levelNumber}_noise_${level}_reconstructedshirt.png`;
        }
    } else {
        // Ankle boot class images (default)
        if (originalImage) {
            originalImage.src = 'images/original.png';
        }
        noisyImage.src = `images/level${levelNumber}_noise_${level}_input.png`;
        reconstructedImage.src = `images/level${levelNumber}_noise_${level}_reconstructed.png`;
    }

}


// Step 7: Latent Space
function runStep7() {
    const btn = document.querySelector('#step-7 .run-btn');
    const output = document.getElementById('output-7');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(7);

    setTimeout(() => {
        output.style.display = 'block';
        btn.innerHTML = '✓ Completed';
        btn.classList.add('completed');
        setStepComplete(7);
        markStepComplete(7);
    }, 1500);
}

function populateLegend() {
    const legendContainer = document.getElementById('legendItems');
    if (!legendContainer) return;

    const colors = [
        '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
        '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ];

    FASHION_CLASSES.forEach((className, idx) => {
        const item = document.createElement('div');
        item.className = 'legend-item';

        const colorBox = document.createElement('div');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = colors[idx];

        const label = document.createElement('span');
        label.textContent = `${idx}: ${className}`;

        item.appendChild(colorBox);
        item.appendChild(label);
        legendContainer.appendChild(item);
    });
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===================================
// RUN ALL & RESET FUNCTIONS
// ===================================

/**
 * Runs all steps sequentially
 */
async function runAllSteps() {
    const runBtn = document.getElementById('btnRunAll');
    if (runBtn.disabled) return;

    runBtn.disabled = true;
    appState.isRunningAll = true;
    runBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" opacity="0.25"/><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"/></svg> Running...';

    const totalSteps = 7;
    const stepFunctions = [runStep1, runStep2, runStep3, runStep4, runStep5, runStep6, runStep7];

    for (let i = 0; i < totalSteps; i++) {
        const stepNum = i + 1;

        // Scroll to current step
        const stepElem = document.getElementById(`step-${stepNum}`);
        if (stepElem) {
            stepElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // If already completed, skip
        if (appState.completedSteps.includes(stepNum)) {
            await sleep(300);
            continue;
        }

        // Run the step function
        stepFunctions[i]();

        // Wait for step to complete
        await new Promise(resolve => {
            const checkInterval = setInterval(() => {
                if (appState.completedSteps.includes(stepNum)) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 200);
        });

        // Small delay between steps
        await sleep(500);
    }

    appState.isRunningAll = false;
    runBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> ✓ Done';
    setTimeout(() => {
        runBtn.disabled = false;
        runBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Run All';
    }, 2000);
}

/**
 * Resets the entire simulation
 */
function resetSimulation() {
    if (confirm('Are you sure you want to reset the simulation? All progress will be lost.')) {
        window.location.reload();
    }
}

/**
 * Initializes Run All and Reset button event listeners
 */
function initializeSidebarActions() {
    const runAllBtn = document.getElementById('btnRunAll');
    const resetBtn = document.getElementById('btnReset');

    if (runAllBtn) {
        runAllBtn.addEventListener('click', runAllSteps);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetSimulation);
    }
}
