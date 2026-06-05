# Autoencoder Virtual Lab - Simulation Playground

## Overview

This interactive simulation playground provides a visual, hands-on learning experience for understanding autoencoders and their denoising capabilities.

## Structure

```
actual/simulation/
├── index.html              # Main simulation interface
├── css/
│   └── simulation.css      # Clean, minimal styling
└── js/
    └── simulation.js       # Interactive functionality
```

## Features

### 1. Pipeline Visualization (Primary Simulation)

A clear visual flow showing how an autoencoder processes images:

- **Original Image** → Clean input from FashionMNIST dataset
- **Noisy Input** → Image with added Gaussian noise
- **Encoder** → Visual compression (784 → 2 dimensions)
- **Latent Space** → 2D representation with coordinates (z₁, z₂)
- **Decoder** → Visual reconstruction (2 → 784 dimensions)
- **Reconstructed** → Denoised output image

**Interactive Controls:**
- **Class Selector**: Choose from 10 FashionMNIST classes
- **Noise Level Slider**: Adjust noise from 0.0 to 1.0 (snaps to discrete levels: 0.1, 0.3, 0.5, 0.7, 0.9)

**Real-time Updates:**
- Images update immediately when controls change
- Pipeline stages animate to show data flow
- Latent coordinates update dynamically

### 2. Latent Space Exploration (Secondary Simulation)

Visualizes how different fashion items cluster in 2D latent space:

- 2D scatter plot showing latent representations
- Color-coded by fashion category
- Legend showing all 10 classes
- Demonstrates dimensionality reduction from 784 to 2 dimensions

## Image Dataset

All images are loaded from `actual/notebook/images/`:

- Class samples: `class1_T-shirt_top.png` through `class10_Ankle_boot.png`
- Noise variations for Trouser: `img3_Trouser_L{1-5}_noise{0.1-0.9}_{input/output}.png`
- Noise variations for Shirt: `level{1-5}_noise_{0.1-0.9}_{inputshirt/reconstructedshirt}.png`
- Noise variations for Ankle boot: `level{1-5}_noise_{0.1-0.9}_{input/reconstructed}.png`
- Original images: `original.png`, `original_idx_7.png`, `img3_Trouser_original.png`
- Latent space plot: `latent_projection.png`

**Note**: Only images from the existing dataset are used. No new images are introduced.

## Noise Slider Logic

The noise slider reuses the exact logic from the notebook:

```javascript
// Available discrete noise levels
const NOISE_LEVELS = [0.1, 0.3, 0.5, 0.7, 0.9];

// Snaps to nearest level on input
function snapToNearestNoiseLevel(value) {
    // Returns closest available noise level
}
```

This matches the behavior in `actual/notebook/script.js` (lines 693-751).

## Design Principles

Following the reference UI guidelines:

1. **Clean & Minimal**: No clutter, focused on learning
2. **Professional**: Matches university virtual lab standards
3. **Intuitive**: Clear labels and visual flow
4. **Responsive**: Works on different screen sizes
5. **Accessible**: High contrast, readable fonts

## Usage

### From Root Landing Page

1. Open `index.html` in the root directory
2. Click "Interactive Playground"
3. Explore the two tabs:
   - Pipeline Visualization
   - Latent Space

### Direct Access

Open `actual/simulation/index.html` directly in a web browser.

### Navigation

- **Back to Notebook**: Click the "← Back to Notebook" link in the header
- **Tab Switching**: Click "Pipeline Visualization" or "Latent Space" tabs

## Educational Objectives

Students will learn:

1. **Autoencoder Architecture**: How encoders compress and decoders reconstruct
2. **Noise Robustness**: How autoencoders can denoise images
3. **Latent Space**: How high-dimensional data is represented in low dimensions
4. **Dimensionality Reduction**: From 784 pixels to just 2 coordinates
5. **Feature Learning**: How networks learn representations without explicit labels

## Technical Details

- **Pure HTML/CSS/JavaScript**: No external dependencies
- **No Model Training**: Uses pre-generated images from notebook
- **Conceptual Visualization**: Focus on understanding, not implementation
- **Real-time Interaction**: Immediate visual feedback

## Browser Compatibility

- Chrome/Edge: Fully supported
- Firefox: Fully supported
- Safari: Fully supported
- IE11: Not supported (use modern browser)

## Files Modified/Created

### New Files
- `/index.html` - Root landing page
- `actual/simulation/index.html` - Main simulation
- `actual/simulation/css/simulation.css` - Styling
- `actual/simulation/js/simulation.js` - Functionality

### Existing Files (Not Modified)
- `actual/notebook/` - Notebook remains unchanged
- `actual/notebook/images/` - Images used by simulation

## Credits

- **Dataset**: FashionMNIST
- **Design Reference**: `reference/` folder
- **Notebook Logic**: Noise slider behavior from `actual/notebook/script.js`
