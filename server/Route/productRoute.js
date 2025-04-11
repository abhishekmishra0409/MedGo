const express = require('express');
const multer = require('multer');
const ProductController = require('../Controllers/productController');
const authMiddleware = require('../Middlewares/authMiddleware');
const adminMiddleware = require('../Middlewares/adminMiddleware');

const router = express.Router();

const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'images', maxCount: 5 }
]);

// Public routes (no authentication required)
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProduct);

// Protected admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/', uploadFields, ProductController.createProduct);
router.put('/:id',uploadFields, ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;