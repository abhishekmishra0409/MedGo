const express = require('express');
const multer = require('multer');
const BlogController = require('../Controllers/blogController');
const doctorMiddleware = require('../Middlewares/doctorMiddleware');

const blogRouter = express.Router();
const upload = multer({ dest: 'uploads/' });

// Public routes (no authentication required)
blogRouter.get('/', BlogController.getAllBlogs);
blogRouter.get('/:id', BlogController.getBlog);

// Protected routes (require doctor authentication)
blogRouter.use(doctorMiddleware);

blogRouter.post('/', upload.single('image'), BlogController.createBlog);
blogRouter.get('/me/blogs', BlogController.getMyBlogs);
blogRouter.put('/:id', upload.single('image'), BlogController.updateBlog);
blogRouter.delete('/:id', BlogController.deleteBlog);

module.exports = blogRouter;