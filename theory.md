## Theory

### Introduction to Autoencoders

Autoencoders are a type of neural network used for unsupervised learning of efficient data representations. Unlike supervised learning methods that require labelled data, autoencoders learn useful features by attempting to reconstruct their input. The main idea is to compress the input into a lower-dimensional representation and then reconstruct the original input from this compressed form using an encoder-decoder architecture, as shown in Fig. 1.

> "High-dimensional data can be converted to low-dimensional codes by training a multilayer neural network with a small central layer to reconstruct high-dimensional input vectors."
> 
> - Hinton & Salakhutdinov, Science, 2006

An autoencoder consists of two main parts:

- **Encoder**: Compresses the input into a latent-space representation (bottleneck layer)
- **Decoder**: Reconstructs the input from the latent representation

The network is trained to minimise the difference between the input and its reconstruction, forcing it to learn the most important features of the data.

![Autoencoder Architecture](images/image4.png)

**Fig. 1:** Architecture of an autoencoder showing the encoder, bottleneck (latent space), and decoder for input reconstruction.

### Types of Autoencoders

#### Basic Autoencoder

A basic autoencoder learns to compress and reconstruct clean input data. As illustrated in Fig. 2, the input image is passed through the encoder, compressed into a bottleneck (latent) representation, and then reconstructed by the decoder.

The bottleneck layer forces the network to learn a compressed representation that captures the essential features of the input while discarding redundant information.

![Basic Autoencoder](images/image6.png)

**Fig. 2:** Basic autoencoder architecture illustrating the encoder, bottleneck (latent space representation), and decoder for input image reconstruction.

#### Denoising Autoencoder

> "A denoising autoencoder is trained to reconstruct a clean 'repaired' input from a corrupted version of it."
> 
> - Vincent et al., ICML 2008

A denoising autoencoder is trained to reconstruct a clean "repaired" input from a corrupted version of it. In this case, noise is deliberately added to the input image, and the corrupted image is then fed into the autoencoder, as shown in Fig. 3. The decoder attempts to reconstruct the original clean image rather than the noisy input.

The training process for a denoising autoencoder can be written as:

**Input:** ![](images/image1.png)

- where **n** is random noise

**Target:** ![](images/image2.png)

- (clean image)

**Loss:** ![](images/image3.png)

As illustrated in Fig. 3, the reconstruction loss is computed by comparing the decoder's output with the original clean image. This forces the network to learn features that are resilient to noise and capture the underlying structure of the data.

![Denoising Autoencoder](images/image5.png)

**Fig. 3:** Denoising autoencoder architecture showing reconstruction of clean images from noisy inputs and computation of reconstruction loss.

### Latent Space Representation

Latent space (bottleneck layer) is the compressed representation learned by the encoder. This compression enables autoencoders to learn hierarchical representations of data.

For visualisation purposes, a 2-dimensional latent space is often used. When the latent dimension is 2, the encoded representations of input images can be directly plotted to observe how the autoencoder organises different patterns in the data.

As shown in Fig. 4, similar fashion items tend to cluster together in the learned latent space, indicating that the autoencoder has learned meaningful and discriminative representations.

![Latent Space Visualization](images/image7.png)

**Fig. 4:** Two-dimensional latent space visualisation of Fashion-MNIST images learned by the autoencoder, showing clustering of similar fashion categories.

### Fashion-MNIST Dataset

Fashion-MNIST is a dataset of grayscale images representing 10 different fashion categories. Each image is 28×28 pixels. The 10 classes are:

1. T-shirt/top
2. Trouser
3. Pullover
4. Dress
5. Coat
6. Sandal
7. Shirt
8. Sneaker
9. Bag
10. Ankle boot

This dataset is commonly used for testing machine learning algorithms because it is more challenging than standard MNIST digits while maintaining the same image format.

### Merits of Autoencoders

- **Unsupervised Learning**: No labelled data required for training
- **Dimensionality Reduction**: Learns compact representations of high-dimensional data
- **Noise Reduction**: Denoising autoencoders can remove noise from corrupted data
- **Feature Learning**: Automatically discovers useful features without manual engineering
- **Data Compression**: Can be used for efficient data storage and transmission

### Demerits of Autoencoders

- **Reconstruction Quality**: May not perfectly reconstruct complex images
- **Training Complexity**: Requires careful tuning of architecture and hyperparameters
- **Computational Cost**: Deep autoencoders require significant training time
- **Task-Specific**: Representations learned may not transfer well to other tasks