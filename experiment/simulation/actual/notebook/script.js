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
    0.0534, 0.0534, 0.0534, 0.0534, 0.0534, // Epochs 1-5
    0.0535, 0.0535, 0.0535, 0.0535, 0.0535, // Epochs 6-10
    0.0485, 0.0485, 0.0485, 0.0485, 0.0485, // Epochs 11-15
    0.0488, 0.0488, 0.0488, 0.0488, 0.0488, // Epochs 16-20
    0.0468, 0.0468, 0.0468, 0.0468, 0.0468, // Epochs 21-25
    0.0476, 0.0476, 0.0476, 0.0476, 0.0476, // Epochs 26-30
    0.0461, 0.0461, 0.0461, 0.0461, 0.0461, // Epochs 31-35
    0.0459, 0.0459, 0.0459, 0.0459, 0.0459, // Epochs 36-40
    0.0455, 0.0455, 0.0455, 0.0455, 0.0455, // Epochs 41-45
    0.0452, 0.0452, 0.0452, 0.0452, 0.0452, // Epochs 46-50
    0.0450, 0.0450, 0.0450, 0.0450, 0.0450, // Epochs 51-55
    0.0448, 0.0448, 0.0448, 0.0448, 0.0448, // Epochs 56-60
    0.0446, 0.0446, 0.0446, 0.0446, 0.0446, // Epochs 61-65
    0.0445, 0.0445, 0.0445, 0.0445, 0.0445, // Epochs 66-70
    0.0444, 0.0444, 0.0444, 0.0444, 0.0444, // Epochs 71-75
    0.0444, 0.0444, 0.0444, 0.0444, 0.0444, // Epochs 76-80
    0.0441, 0.0441, 0.0441, 0.0441, 0.0441, // Epochs 81-85
    0.0441, 0.0441, 0.0441, 0.0441, 0.0441, // Epochs 86-90
    0.0442, 0.0442, 0.0442, 0.0442, 0.0442, // Epochs 91-95
    0.0439, 0.0439, 0.0439, 0.0439, 0.0439  // Epochs 96-100
];

// Basic AE training loss data (clean→clean, no noise)
const BASIC_TRAINING_LOSSES = [
    0.0536, 0.0536, 0.0536, 0.0536, 0.0536, // Epochs 1-5
    0.0507, 0.0507, 0.0507, 0.0507, 0.0507, // Epochs 6-10
    0.0506, 0.0506, 0.0506, 0.0506, 0.0506, // Epochs 11-15
    0.0499, 0.0499, 0.0499, 0.0499, 0.0499, // Epochs 16-20
    0.0464, 0.0464, 0.0464, 0.0464, 0.0464, // Epochs 21-25
    0.0458, 0.0458, 0.0458, 0.0458, 0.0458, // Epochs 26-30
    0.0455, 0.0455, 0.0455, 0.0455, 0.0455, // Epochs 31-35
    0.0451, 0.0451, 0.0451, 0.0451, 0.0451, // Epochs 36-40
    0.0450, 0.0450, 0.0450, 0.0450, 0.0450, // Epochs 41-45
    0.0449, 0.0449, 0.0449, 0.0449, 0.0449, // Epochs 46-50
    0.0447, 0.0447, 0.0447, 0.0447, 0.0447, // Epochs 51-55
    0.0445, 0.0445, 0.0445, 0.0445, 0.0445, // Epochs 56-60
    0.0445, 0.0445, 0.0445, 0.0445, 0.0445, // Epochs 61-65
    0.0446, 0.0446, 0.0446, 0.0446, 0.0446, // Epochs 66-70
    0.0445, 0.0445, 0.0445, 0.0445, 0.0445, // Epochs 71-75
    0.0445, 0.0445, 0.0445, 0.0445, 0.0445, // Epochs 76-80
    0.0445, 0.0445, 0.0445, 0.0445, 0.0445, // Epochs 81-85
    0.0445, 0.0445, 0.0445, 0.0445, 0.0445, // Epochs 86-90
    0.0444, 0.0444, 0.0444, 0.0444, 0.0444, // Epochs 91-95
    0.0444, 0.0444, 0.0444, 0.0444, 0.0444  // Epochs 96-100
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
        // setupNoiseControl(); // Interactive control removed
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

// Scroll observer removed to prevent auto-highlighting/scrolling
function initializeScrolling() {
    // Only manual navigation is allowed
    const sidebarItems = document.querySelectorAll('.step-item');

    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const stepNum = parseInt(item.dataset.step);
            const stepId = `step-${stepNum}`;
            const targetElement = document.getElementById(stepId);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
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

    // Step 2: Add dataset
    const step2Btn = document.querySelector('#step-2 .run-btn');
    if (step2Btn) {
        step2Btn.addEventListener('click', () => runStep2());
    }

    // Step 3: Load Dataset
    const step3Btn = document.querySelector('#step-3 .run-btn');
    if (step3Btn) {
        step3Btn.addEventListener('click', () => runStep3());
    }

    // Step 4: Show Dataset Sample
    const step4Btn = document.querySelector('#step-4 .run-btn');
    if (step4Btn) {
        step4Btn.addEventListener('click', () => runStep4());
    }

    // Step 5: Model Architecture
    const step5Btn = document.querySelector('#step-5 .run-btn');
    if (step5Btn) {
        step5Btn.addEventListener('click', () => runStep5());
    }

    // Step 6: Basic AE Training
    const step6Btn = document.querySelector('#step-6 .run-btn');
    if (step6Btn) {
        step6Btn.addEventListener('click', () => runStep6());
    }

    // Step 7: Basic AE Reconstruction
    const step7Btn = document.querySelector('#step-7 .run-btn');
    if (step7Btn) {
        step7Btn.addEventListener('click', () => runStep7());
    }

    // Step 8: Denoising AE Training
    const step8Btn = document.querySelector('#step-8 .run-btn');
    if (step8Btn) {
        step8Btn.addEventListener('click', () => runStep8());
    }

    // Step 9: Denoising Reconstruction
    const step9Btn = document.querySelector('#step-9 .run-btn');
    if (step9Btn) {
        step9Btn.addEventListener('click', () => runStep9());
    }

    // Step 10: Noise Robustness
    const step10Btn = document.querySelector('#step-10 .run-btn');
    if (step10Btn) {
        step10Btn.addEventListener('click', () => runStep10());
    }

    // Step 11: Latent Space
    const step11Btn = document.querySelector('#step-11 .run-btn');
    if (step11Btn) {
        step11Btn.addEventListener('click', () => runStep11());
    }

    // Step 12: Quantitative Evaluation
    const step12Btn = document.querySelector('#step-12 .run-btn');
    if (step12Btn) {
        step12Btn.addEventListener('click', () => runStep12());
    }
}

function updateStepButtons() {
    const sidebarItems = document.querySelectorAll('.step-item');
    const stepContents = document.querySelectorAll('.step-content');

    // 1. Update Sidebar Items
    sidebarItems.forEach((item, idx) => {
        const stepNum = idx + 1;
        item.classList.remove('active', 'completed', 'running');

        // Simple logic: Completed steps are green ('completed')
        if (appState.completedSteps.includes(stepNum)) {
            item.classList.add('completed');
        }

        // Active step handling could be simple or removed if no specific 'active' state needed
        // For now, let's keep it clean: no special 'active' based on scroll
    });

    // 2. Update Step Content & Sequential Locking
    stepContents.forEach((content, idx) => {
        const stepNum = idx + 1;
        const runBtn = content.querySelector('.run-btn');

        // Remove old classes
        content.classList.remove('active', 'completed', 'locked');

        // Check if previous step is completed (Step 1 is always unlocked)
        const isUnlocked = stepNum === 1 || appState.completedSteps.includes(stepNum - 1);
        const isCompleted = appState.completedSteps.includes(stepNum);

        if (isUnlocked) {
            content.classList.remove('locked');
            if (runBtn) {
                // If step is completed, keep button disabled
                // If step is running, keep it disabled
                // Otherwise enable it
                if (isCompleted || runBtn.classList.contains('running') || runBtn.classList.contains('completed')) {
                    runBtn.disabled = true;
                } else {
                    runBtn.disabled = false;
                }
            }
        } else {
            content.classList.add('locked');
            if (runBtn) {
                runBtn.disabled = true;
            }
        }

        if (isCompleted) {
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
        btn.disabled = true; // Keep disabled after completion
        setStepComplete(1);
        markStepComplete(1);

        // Auto-scroll removed - user navigates manually
        if (!appState.isRunningAll) {
            // No autoscroll
        }
    }, 800);
}

// Step 2: Add dataset
function runStep2() {
    const btn = document.querySelector('#step-2 .run-btn');
    const output = document.getElementById('output-2');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(2);

    setTimeout(() => {
        output.style.display = 'block';
        btn.innerHTML = '✓ Completed';
        btn.classList.add('completed');
        btn.disabled = true; // Keep disabled after completion
        setStepComplete(2);
        markStepComplete(2);

        if (!appState.isRunningAll) {
            setTimeout(() => {
                appState.completedSteps.push(2);
                updateStepButtons();
            }, 500);
        }
    }, 1000);
}

// Step 3: Load Dataset
function runStep3() {
    const btn = document.querySelector('#step-3 .run-btn');
    const output = document.getElementById('output-3');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(3);

    setTimeout(() => {
        output.style.display = 'block';
        btn.innerHTML = '✓ Completed';
        btn.classList.add('completed');
        btn.disabled = true; // Keep disabled after completion
        setStepComplete(3);
        markStepComplete(3);

        if (!appState.isRunningAll) {
            setTimeout(() => {
                appState.completedSteps.push(3);
                updateStepButtons();
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

// Step 4: Show Dataset Sample
function runStep4() {
    const btn = document.querySelector('#step-4 .run-btn');
    const output = document.getElementById('output-4');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(4);

    setTimeout(() => {
        // Create dataset grid
        createDatasetGrid();

        output.style.display = 'block';
        btn.innerHTML = '✓ Completed';
        btn.classList.add('completed');
        btn.disabled = true; // Keep disabled after completion
        setStepComplete(4);
        markStepComplete(4);

        if (!appState.isRunningAll) {
            setTimeout(() => {
                appState.completedSteps.push(4);
                updateStepButtons();
            }, 500);
        }
    }, 1000);
}

// Step 5: Model Architecture
function runStep5() {
    const btn = document.querySelector('#step-5 .run-btn');
    const output = document.getElementById('output-5');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(5);

    setTimeout(() => {
        // Draw the architecture diagram - REMOVED for static output
        // drawArchitectureDiagram();

        output.style.display = 'block';
        btn.innerHTML = '✓ Completed';
        btn.classList.add('completed');
        btn.disabled = true; // Keep disabled after completion
        setStepComplete(5);
        markStepComplete(5);

        if (!appState.isRunningAll) {
            setTimeout(() => {
                appState.completedSteps.push(5);
                updateStepButtons();
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

// Step 6: Basic AE Training
function runStep6() {
    const btn = document.querySelector('#step-6 .run-btn');
    const output = document.getElementById('output-6');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(6);

    output.style.display = 'block';

    simulateBasicTraining();
}

function simulateBasicTraining() {
    const outputContainer = document.getElementById('basicTrainingOutput');
    if (!outputContainer) return;

    outputContainer.innerHTML = '<div class="output-text">Starting basic autoencoder training...</div>';

    let currentEpoch = 0;
    const totalEpochs = 100;
    const displayInterval = 5;

    const interval = setInterval(() => {
        if (currentEpoch >= totalEpochs) {
            clearInterval(interval);

            const btn = document.querySelector('#step-6 .run-btn');
            btn.innerHTML = '✓ Completed';
            btn.classList.add('completed');
            btn.disabled = true;
            setStepComplete(6);
            markStepComplete(6);

            const bestLoss = Math.min(...BASIC_TRAINING_LOSSES);
            const completionMsg = document.createElement('div');
            completionMsg.className = 'output-text';
            completionMsg.style.marginTop = '10px';
            completionMsg.style.color = '#198754';
            completionMsg.textContent = `Training completed! Best Loss: ${bestLoss.toFixed(4)}`;
            outputContainer.appendChild(completionMsg);

            if (!appState.isRunningAll) {
                setTimeout(() => {
                    appState.completedSteps.push(6);
                    updateStepButtons();
                }, 500);
            }
            return;
        }

        currentEpoch += 1;

        if (currentEpoch % displayInterval === 0) {
            const epochLine = document.createElement('div');
            epochLine.className = 'output-text';
            epochLine.style.fontFamily = "'Consolas', 'Monaco', 'Courier New', monospace";
            epochLine.style.fontSize = '0.85rem';
            epochLine.style.padding = '2px 8px';
            epochLine.style.borderLeft = 'none';
            epochLine.style.background = 'transparent';
            epochLine.style.margin = '0';

            const loss = BASIC_TRAINING_LOSSES[currentEpoch - 1];
            epochLine.innerHTML = `Epoch [<span style="color: #6f42c1;">${currentEpoch}/${totalEpochs}</span>] Loss: <span style="color: #dc3545;">${loss.toFixed(4)}</span>`;
            outputContainer.appendChild(epochLine);
        }
    }, 30);
}

// Step 7: Basic AE Reconstruction
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
        btn.disabled = true;
        setStepComplete(7);
        markStepComplete(7);

        if (!appState.isRunningAll) {
            setTimeout(() => {
                appState.completedSteps.push(7);
                updateStepButtons();
            }, 500);
        }
    }, 1000);
}

// Step 8: Denoising AE Training
function runStep8() {
    const btn = document.querySelector('#step-8 .run-btn');
    const output = document.getElementById('output-8');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(8);

    output.style.display = 'block';

    // Simulate training
    simulateDenoisingTraining();
}

function simulateDenoisingTraining() {
    const outputContainer = document.getElementById('denoisingTrainingOutput');
    if (!outputContainer) return;

    // Clear previous content and add starting message
    outputContainer.innerHTML = '<div class="output-text">Starting training...</div>';

    let currentEpoch = 0;
    const totalEpochs = 100;

    // Show epochs every 5 iterations
    const displayInterval = 5;

    const interval = setInterval(() => {
        if (currentEpoch >= totalEpochs) {
            clearInterval(interval);

            const btn = document.querySelector('#step-8 .run-btn');
            btn.innerHTML = '✓ Completed';
            btn.classList.add('completed');
            btn.disabled = true; // Keep disabled after completion
            setStepComplete(8);
            markStepComplete(8);

            // Add completion message
            const bestLoss = Math.min(...TRAINING_LOSSES);
            const completionMsg = document.createElement('div');
            completionMsg.className = 'output-text';
            completionMsg.style.marginTop = '10px';
            completionMsg.style.color = '#198754';
            completionMsg.textContent = `Training completed! Best Loss: ${bestLoss.toFixed(4)}`;
            outputContainer.appendChild(completionMsg);

            if (!appState.isRunningAll) {
                setTimeout(() => {
                    appState.completedSteps.push(8);
                    updateStepButtons();
                }, 500);
            }

            return;
        }

        currentEpoch += 1;

        // Display epoch info every 5 epochs
        if (currentEpoch % displayInterval === 0) {
            const epochLine = document.createElement('div');
            epochLine.className = 'output-text';
            epochLine.style.fontFamily = "'Consolas', 'Monaco', 'Courier New', monospace";
            epochLine.style.fontSize = '0.85rem';
            epochLine.style.padding = '2px 8px';
            epochLine.style.borderLeft = 'none';
            epochLine.style.background = 'transparent';
            epochLine.style.margin = '0';

            const loss = TRAINING_LOSSES[currentEpoch - 1];
            epochLine.innerHTML = `Epoch [<span style="color: #6f42c1;">${currentEpoch}/${totalEpochs}</span>] Loss: <span style="color: #dc3545;">${loss.toFixed(4)}</span>`;

            outputContainer.appendChild(epochLine);
        }

    }, 30); // Faster animation
}

// Step 9: Denoising Reconstruction
function runStep9() {
    const btn = document.querySelector('#step-9 .run-btn');
    const output = document.getElementById('output-9');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(9);

    setTimeout(() => {
        output.style.display = 'block';
        btn.innerHTML = '✓ Completed';
        btn.classList.add('completed');
        btn.disabled = true; // Keep disabled after completion
        setStepComplete(9);
        markStepComplete(9);

        if (!appState.isRunningAll) {
            setTimeout(() => {
                appState.completedSteps.push(9);
                updateStepButtons();
            }, 500);
        }
    }, 1000);
}

// Step 10: Noise Robustness
function runStep10() {
    const btn = document.querySelector('#step-10 .run-btn');
    const output = document.getElementById('output-10');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(10);

    setTimeout(() => {
        output.style.display = 'block';
        btn.innerHTML = '✓ Completed';
        btn.classList.add('completed');
        btn.disabled = true; // Keep disabled after completion
        setStepComplete(10);
        markStepComplete(10);

        if (!appState.isRunningAll) {
            setTimeout(() => {
                appState.completedSteps.push(10);
                updateStepButtons();
            }, 500);
        }
    }, 1000);
}

function setupNoiseControl() {
    const slider = document.getElementById('noiseSlider');
    const valueDisplay = document.getElementById('noiseValue');
    const classSelector = document.getElementById('classSelector');

    // Available discrete noise levels - matching the markers
    const noiseLevels = [0.0, 0.25, 0.5, 0.75, 1.0];

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

        // Set initial images - start at 0.25
        updateNoiseImages(0.25, 'boot');
        slider.value = 25; // Set to 0.25 initially
        valueDisplay.textContent = '0.25';
    }

    // Handle class selection change
    if (classSelector) {
        classSelector.addEventListener('change', (e) => {
            const rawValue = slider ? slider.value / 100 : 0.25;
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


// Step 11: Latent Space
function runStep11() {
    const btn = document.querySelector('#step-11 .run-btn');
    const output = document.getElementById('output-11');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(11);

    setTimeout(() => {
        output.style.display = 'block';
        btn.innerHTML = '✓ Completed';
        btn.classList.add('completed');
        btn.disabled = true; // Keep disabled after completion
        setStepComplete(11);
        markStepComplete(11);
    }, 1500);
}

// Step 12: Quantitative Evaluation
function runStep12() {
    const btn = document.querySelector('#step-12 .run-btn');
    const output = document.getElementById('output-12');

    btn.disabled = true;
    btn.innerHTML = '<span>Running...</span>';
    setStepRunning(12);

    setTimeout(() => {
        output.style.display = 'block';
        btn.innerHTML = '✓ Completed';
        btn.classList.add('completed');
        btn.disabled = true; // Keep disabled after completion
        setStepComplete(12);
        markStepComplete(12);
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
    // const runAllBtn = document.getElementById('btnRunAll');
    const resetBtn = document.getElementById('btnReset');

    // if (runAllBtn) {
    //     runAllBtn.addEventListener('click', runAllSteps);
    // }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetSimulation);
    }
}
