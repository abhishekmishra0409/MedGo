const BlogService = require('../Services/blogServices');

class BlogController {
    static async createBlog(req, res) {
        try {
            if (!req.file) throw new Error('Blog image is required');
            const blog = await BlogService.createBlog(
                req.body,
                req.file,
                req.user.id
            );
            res.status(201).json({
                success: true,
                data: blog
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getBlog(req, res) {
        try {
            const blog = await BlogService.getBlogById(req.params.id);
            if (!blog) {
                return res.status(404).json({
                    success: false,
                    error: 'Blog not found'
                });
            }
            res.status(200).json({
                success: true,
                data: blog
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getAllBlogs(req, res) {
        try {
            const blogs = await BlogService.getAllBlogs();
            res.status(200).json({
                success: true,
                count: blogs.length,
                data: blogs
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async updateBlog(req, res) {
        try {
            const blog = await BlogService.updateBlog(
                req.params.id,
                req.body,
                req.file,
                req.user.id
            );
            res.status(200).json({
                success: true,
                data: blog
            });
        } catch (error) {
            const status = error.message.includes('unauthorized') ? 403 : 400;
            res.status(status).json({
                success: false,
                error: error.message
            });
        }
    }

    static async deleteBlog(req, res) {
        try {
            const result = await BlogService.deleteBlog(
                req.params.id,
                req.user.id
            );
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            const status = error.message.includes('unauthorized') ? 403 : 400;
            res.status(status).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getMyBlogs(req, res) {
        try {
            const blogs = await BlogService.getDoctorBlogs(req.user.id);
            res.status(200).json({
                success: true,
                count: blogs.length,
                data: blogs
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = BlogController;