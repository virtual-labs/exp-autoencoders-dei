### Procedure

**Step 1: Import Required Libraries**

Import PyTorch for model building, torchvision for datasets, NumPy for numerical operations, and Matplotlib for visualization.

**Step 2: Load Fashion-MNIST Dataset**

Load the Fashion-MNIST dataset, which contains 60,000 training images and 10,000 test images. Each image is a 28×28 grayscale image belonging to one of 10 fashion classes. Create data loaders with a batch size of 128 for efficient training and evaluation.

Normalize the pixel values to the range [0, 1]. Since the dataset is already cleanly structured, no special cleaning is required.

**Fashion-MNIST Dataset**

Fashion-MNIST is a dataset of grayscale images representing 10 different fashion categories. Each image is 28×28 pixels. The 10 classes are:

* T-shirt/top
* Trouser
* Pullover
* Dress
* Coat
* Sandal
* Shirt
* Sneaker
* Bag
* Ankle boot

This dataset is commonly used for testing machine learning algorithms because it is more challenging than standard MNIST digits while maintaining the same image format.

**Step 3: Create a Noise Addition Function**

Define a function that adds Gaussian noise to the input image while keeping the clean image unchanged as the target. Use a noise factor of 0.25 when training the denoising autoencoder.

**Step 4: Define the Basic Autoencoder Architecture**

Build a fully connected autoencoder with:

* **Encoder:** flatten the 28×28 input into 784 features and compress it through multiple dense layers to a 2-dimensional latent vector

* **Decoder:** expand the 2-dimensional latent vector back to 784 features and reshape it to 28×28

* Use **ReLU** in the hidden layers and **Sigmoid** in the final output layer

The basic autoencoder is trained on clean images so that it learns to reconstruct the input without noise removal.

**Encoder:**

* Flatten 28×28 input → 784 dimensions
* Linear layers: 784 → 512 → 256 → 128 → 64 → 32 → 16 → 8 → 4 → 2 (latent)
* Include BatchNorm1d and ReLU after each layer
* Add Dropout (0.2, 0.2, 0.1) for regularisation in early layers

**Decoder (mirror structure):**

* Linear layers: 2 → 4 → 8 → 16 → 32 → 64 → 128 → 256 → 512 → 784
* BatchNorm1d and ReLU between layers
* Sigmoid activation at output to produce [0, 1] pixel values
* Reshape to 28×28 image

The 2-dimensional latent space allows for direct visualization of learned representations as scatter plots, where we can observe how the autoencoder organizes different fashion categories in the compressed feature space.

**Step 5: Train the Basic Autoencoder**

For each epoch:

* Pass clean images through the encoder and decoder
* Compute MSE loss between the clean input and the reconstruction
* Backpropagate gradients and update weights using the AdamW optimiser
* Track training and validation loss to monitor convergence

Save the best-performing basic autoencoder model based on the lowest validation loss.

**Step 6: Training Configuration**

* **Loss Function:** Combined MSE and L1 loss for better detail preservation
* **Optimiser:** AdamW with appropriate learning rate and weight decay for regularisation
* Use ReduceLROnPlateau **Learning Rate Scheduler** to automatically reduce learning rate when training plateaus
* **Training Duration:** Train for sufficient epochs until convergence
* **Gradient Clipping:** Apply gradient clipping for training stability and to prevent exploding gradients
* **Model Checkpointing:** Save the best performing model based on the lowest validation loss

**Step 7: Train the Denoising Autoencoder**

For each epoch:

* Add Gaussian noise to input images
* Forward pass-through encoder and decoder
* Compute combined loss (MSE + L1) between clean targets and reconstructions
* Backpropagate gradients with clipping
* Update weights and adjust learning rate
* Track and save the best model

**Step 8: Visualisation 1 - Basic Reconstruction**

Display 8 test samples showing:

* Original clean images (row 1)
* Noisy input images (row 2)
* Reconstructed denoised images (row 3)

This demonstrates the denoising capability side-by-side.

**Step 9: Visualisation 2 - Error Maps**

Create heat maps showing pixel-wise reconstruction errors for 6 samples. Brighter regions indicate higher errors; darker regions show better reconstruction. This helps identify which image regions are harder to reconstruct.

**Step 10: Visualisation 3 - Noise Robustness Test**

Test model performance at different noise levels (0.1, 0.25, 0.4, 0.6) on the same image. Display original, noisy input, and reconstruction for each noise level to show how well the model handles varying corruption.

**Step 11: Visualisation 4 - Latent Space Projection**

Extract 2-D latent representations for all test images. Since the latent dimension is already 2, plot all test samples directly as points in a 2-D scatter plot, with different colours representing the 10 fashion classes.

This visualisation reveals how the autoencoder organises different fashion categories in the learned latent space. Similar items should cluster together, demonstrating that the autoencoder has learned meaningful representations.

**Step 12: Quantitative Evaluation**

Calculate performance metrics on the test set:

* **MSE:** Mean Squared Error (lower is better)
* **PSNR:** Peak Signal-to-Noise Ratio in dB (higher is better)
* **SSIM:** Structural Similarity Index (higher is better, range 0-1)