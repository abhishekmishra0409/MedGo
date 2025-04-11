const ProductService = require('../Services/productServices');

class ProductController {
    static async createProduct(req, res) {
        try {
            if (!req.files?.image || !req.files?.images) {
                throw new Error('Main image and additional images are required');
            }

            const product = await ProductService.createProduct(req.body, req.files);
            res.status(201).json({
                success: true,
                data: product
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getProduct(req, res) {
        try {
            const product = await ProductService.getProductById(req.params.id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }
            res.status(200).json({
                success: true,
                data: product
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getAllProducts(req, res) {
        try {
            const { category, isHot, isNew } = req.query;
            const filter = {};

            if (category) filter.category = category;
            if (isHot) filter.isHot = isHot === 'true';
            if (isNew) filter.isNew = isNew === 'true';

            const products = await ProductService.getAllProducts(filter);
            res.status(200).json({
                success: true,
                count: products.length,
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async updateProduct(req, res) {
        try {
            const product = await ProductService.updateProduct(
                req.params.id,
                req.body,
                req.files
            );
            res.status(200).json({
                success: true,
                data: product
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async deleteProduct(req, res) {
        try {
            const result = await ProductService.deleteProduct(req.params.id);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = ProductController;