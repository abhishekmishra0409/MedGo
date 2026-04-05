const Blog = require('../Models/BlogModel');
const cloudinary = require('cloudinary').v2;
const { buildDoctorAccount } = require('../Utils/doctorAccount');

const serializeBlog = (blog) => {
    if (!blog) {
        return blog;
    }

    const source = blog.toObject ? blog.toObject() : blog;

    return {
        ...source,
        author: source.author ? buildDoctorAccount(source.author) : null,
    };
};

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
            const blog = await Blog.findById(id).populate('author', '_id name username email phone avatar role doctorProfile');
            return serializeBlog(blog);
        } catch (error) {
            throw new Error(`Blog not found: ${error.message}`);
        }
    }

    static async getAllBlogs() {
        try {
            const blogs = await Blog.find().populate('author', '_id name username email phone avatar role doctorProfile');
            return blogs.map(serializeBlog);
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
