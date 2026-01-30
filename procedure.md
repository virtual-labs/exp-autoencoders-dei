## Procedure

### Step 1: Import Required Libraries

Import PyTorch for model building, torchvision for datasets, NumPy for numerical operations, and Matplotlib for visualisation.

### Step 2: Load Fashion-MNIST Dataset

Load the dataset containing 60,000 training and 10,000 test images (28×28 grayscale). Each image belongs to one of 10 fashion categories. Create Data Loaders with batch size 128 for efficient training.

### Step 3: Data Preprocessing

Convert images to tensors with pixel values normalised to [0, 1]. For denoising, define a noise addition function that adds Gaussian noise (noise factor = 0.25) while keeping targets clean.

### Step 4: Define Autoencoder Architecture

Build an improved autoencoder with:

**Encoder:**

- Flatten 28×28 input → 784 dimensions
- Linear layers: **784 → 512 → 256 → 128 → 64 → 32 → 16 → 8 → 4 → 2 (latent)**
- Include BatchNorm1d and ReLU after each layer
- Add Dropout (0.2, 0.2, 0.1) for regularisation in early layers

**Decoder (mirror structure):**

- Linear layers: **2 → 4 → 8 → 16 → 32 → 64 → 128 → 256 → 512 → 784**
- BatchNorm1d and ReLU between layers
- Sigmoid activation at output to produce [0, 1] pixel values
- Reshape to 28×28 image

The **2-dimensional latent space** allows for direct visualisation of learned representations as scatter plots, where we can observe how the autoencoder organises different fashion categories in the compressed feature space.

### Step 5: Training Configuration

- **Loss Function**: Combined MSE and L1 loss for better detail preservation
- **Optimiser**: AdamW with appropriate learning rate and weight decay for regularisation
- Use ReduceLROnPlateau **Learning Rate Scheduler** to automatically reduce learning rate when training plateaus
- **Training Duration**: Train for sufficient epochs until convergence
- **Gradient Clipping**: Apply gradient clipping for training stability and to prevent exploding gradients
- **Model Checkpointing**: Save the best performing model based on lowest validation loss

### Step 6: Train the Denoising Autoencoder

For each epoch:

- Add Gaussian noise to input images
- Forward pass-through encoder and decoder
- Compute combined loss (MSE + L1) between clean targets and reconstructions
- Backpropagate gradients with clipping
- Update weights and adjust learning rate
- Track and save best model

### Step 7: Visualisation 1 - Basic Reconstruction

Display 8 test samples showing:

- Original clean images (row 1)
- Noisy input images (row 2)
- Reconstructed denoised images (row 3)

This demonstrates the denoising capability side-by-side.

### Step 8: Visualisation 2 - Error Maps

Create heat maps showing pixel-wise reconstruction errors for 6 samples. Brighter regions indicate higher errors; darker regions show better reconstruction. This helps identify which image regions are harder to reconstruct.

### Step 9: Visualisation 3 - Noise Robustness Test

Test model performance at different noise levels (0.1, 0.25, 0.4, 0.6) on the same image. Display original, noisy input, and reconstruction for each noise level to show how well the model handles varying corruption.

### Step 10: Visualisation 4 - Latent Space Projection

Extract 2-D latent representations for all test images. Since the latent dimension is already 2, plot all test samples directly as points in a 2-D scatter plot, with different colours representing the 10 fashion classes.

This visualisation reveals how the autoencoder organises different fashion categories in the learned latent space. Similar items should cluster together, demonstrating that the autoencoder has learned meaningful representations.

### Step 11: Quantitative Evaluation

Calculate performance metrics on test set:

- **MSE**: Mean Squared Error (lower is better)
- **PSNR**: Peak Signal-to-Noise Ratio in dB (higher is better)
- **SSIM**: Structural Similarity Index (higher is better, range 0-1)