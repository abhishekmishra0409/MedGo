const Product = require('../Models/ProductModel');
const cloudinary = require('cloudinary').v2;

class ProductService {
    static async createProduct(productData, files) {
        let mainImage, additionalImages;

        try {
            // Validate required files
            if (!files?.image || !files?.images) {
                throw new Error('Main image and additional images are required');
            }

            // Upload main image
            mainImage = await cloudinary.uploader.upload(files.image[0].path, {
                folder: 'products/main'
            });

            // Upload additional images
            additionalImages = await Promise.all(
                files.images.map(file =>
                    cloudinary.uploader.upload(file.path, {
                        folder: 'products/additional'
                    })
                )
            );

            const product = new Product({
                ...productData,
                image: mainImage.secure_url,
                images: additionalImages.map(img => img.secure_url),
                cloudinaryIds: {
                    main: mainImage.public_id,
                    additional: additionalImages.map(img => img.public_id)
                }
            });

            await product.save();
            return product;
        } catch (error) {
            // Cleanup uploaded files if error occurs
            if (mainImage?.public_id) {
                await cloudinary.uploader.destroy(mainImage.public_id);
            }
            if (additionalImages?.length) {
                await Promise.all(
                    additionalImages.map(img =>
                        cloudinary.uploader.destroy(img.public_id)
                    )
                );
            }
            throw new Error(`Product creation failed: ${error.message}`);
        }
    }

    static async updateProduct(id, updateData, files) {
        let product;
        let newMainImage, newAdditionalImages;

        try {
            product = await Product.findById(id);
            if (!product) throw new Error('Product not found');

            // Handle main image update
            if (files?.image) {
                // Upload new main image
                newMainImage = await cloudinary.uploader.upload(files.image[0].path, {
                    folder: 'products/main'
                });

                // Delete old main image
                await cloudinary.uploader.destroy(product.cloudinaryIds.main);

                updateData.image = newMainImage.secure_url;
                updateData.cloudinaryIds = {
                    ...product.cloudinaryIds,
                    main: newMainImage.public_id
                };
            }

            // Handle additional images update
            if (files?.images) {
                // Upload new additional images
                newAdditionalImages = await Promise.all(
                    files.images.map(file =>
                        cloudinary.uploader.upload(file.path, {
                            folder: 'products/additional'
                        })
                    )
                );

                // Delete old additional images
                await Promise.all(
                    product.cloudinaryIds.additional.map(id =>
                        cloudinary.uploader.destroy(id)
                    )
                );

                updateData.images = newAdditionalImages.map(img => img.secure_url);
                updateData.cloudinaryIds = {
                    ...(updateData.cloudinaryIds || product.cloudinaryIds),
                    additional: newAdditionalImages.map(img => img.public_id)
                };
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );

            return updatedProduct;
        } catch (error) {
            // Cleanup any uploaded files if error occurs
            if (newMainImage?.public_id) {
                await cloudinary.uploader.destroy(newMainImage.public_id);
            }
            if (newAdditionalImages?.length) {
                await Promise.all(
                    newAdditionalImages.map(img =>
                        cloudinary.uploader.destroy(img.public_id)
                    )
                );
            }
            throw new Error(`Product update failed: ${error.message}`);
        }
    }

    static async deleteProduct(id) {
        try {
            const product = await Product.findById(id);
            if (!product) throw new Error('Product not found');

            // Delete all images from Cloudinary
            await cloudinary.uploader.destroy(product.cloudinaryIds.main);
            await Promise.all(
                product.cloudinaryIds.additional.map(id =>
                    cloudinary.uploader.destroy(id)
                )
            );

            await Product.findByIdAndDelete(id);
            return { message: 'Product deleted successfully' };
        } catch (error) {
            throw new Error(`Product deletion failed: ${error.message}`);
        }
    }

    static async getProductById(id) {
        try {
            return await Product.findById(id);
        } catch (error) {
            throw new Error(`Product not found: ${error.message}`);
        }
    }

    static async getAllProducts(filter = {}) {
        try {
            return await Product.find(filter);
        } catch (error) {
            throw new Error(`Failed to fetch products: ${error.message}`);
        }
    }
}

module.exports = ProductService;