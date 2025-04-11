const Blog = require('../Models/BlogModel');
const Doctor = require('../Models/DoctorModel');
const cloudinary = require('cloudinary').v2;

class BlogService {
    static async createBlog(blogData, file, doctorId) {
        try {
            // Upload image to Cloudinary
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'blogs'
            });

            const blog = new Blog({
                ...blogData,
                author: doctorId,
                image: result.secure_url,
                cloudinary_id: result.public_id,
                date: new Date()
            });

            await blog.save();
            return blog;
        } catch (error) {
            throw new Error(`Blog creation failed: ${error.message}`);
        }
    }

    static async getBlogById(id) {
        try {
            return await Blog.findById(id).populate('author', 'name specialty');
        } catch (error) {
            throw new Error(`Blog not found: ${error.message}`);
        }
    }

    static async getAllBlogs() {
        try {
            return await Blog.find().populate('author', 'name specialty image');
        } catch (error) {
            throw new Error(`Failed to fetch blogs: ${error.message}`);
        }
    }

    static async updateBlog(id, updateData, file, doctorId) {
        try {
            const blog = await Blog.findOne({ _id: id, author: doctorId });
            if (!blog) throw new Error('Blog not found or unauthorized');

            if (file) {
                // Delete old image
                if (blog.cloudinary_id) {
                    await cloudinary.uploader.destroy(blog.cloudinary_id);
                }
                // Upload new image
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'blogs'
                });
                updateData.image = result.secure_url;
                updateData.cloudinary_id = result.public_id;
            }

            return await Blog.findByIdAndUpdate(id, updateData, { new: true });
        } catch (error) {
            throw new Error(`Blog update failed: ${error.message}`);
        }
    }

    static async deleteBlog(id, doctorId) {
        try {
            const blog = await Blog.findOne({ _id: id, author: doctorId });
            if (!blog) throw new Error('Blog not found or unauthorized');

            // Delete image from Cloudinary
            if (blog.cloudinary_id) {
                await cloudinary.uploader.destroy(blog.cloudinary_id);
            }

            await Blog.findByIdAndDelete(id);
            return { message: 'Blog deleted successfully' };
        } catch (error) {
            throw new Error(`Blog deletion failed: ${error.message}`);
        }
    }

    static async getDoctorBlogs(doctorId) {
        try {
            return await Blog.find({ author: doctorId });
        } catch (error) {
            throw new Error(`Failed to fetch doctor blogs: ${error.message}`);
        }
    }
}

module.exports = BlogService;