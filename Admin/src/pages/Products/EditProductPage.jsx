import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getProductById, updateProduct } from '../../features/Products/ProductSlice.js';
import { UploadCloud, X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EditProductPage = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { product, isLoading } = useSelector((state) => state.product);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        originalPrice: '',
        category: '',
        description: '',
        benefits: [''],
        dosage: '',
        isHot: false,
        isNew: false,
        stock: '',
    });

    // Image states
    const [mainImage, setMainImage] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState('');
    const [additionalImages, setAdditionalImages] = useState([]);
    const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);

    // Fetch product data when component mounts or ID changes
    useEffect(() => {
        dispatch(getProductById(id));
    }, [id, dispatch]);

    // Populate form when product data is loaded
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                price: product.price || '',
                originalPrice: product.originalPrice || '',
                category: product.category || '',
                description: product.description || '',
                benefits: product.benefits?.length ? product.benefits : [''],
                dosage: product.dosage || '',
                isHot: product.isHot || false,
                isNew: product.isNew || false,
                stock: product.stock || '',
            });

            setMainImagePreview(product.image || '');
            setAdditionalImagePreviews(product.images || []);
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleBenefitChange = (index, value) => {
        const newBenefits = [...formData.benefits];
        newBenefits[index] = value;
        setFormData({ ...formData, benefits: newBenefits });
    };

    const addBenefit = () => {
        setFormData({ ...formData, benefits: [...formData.benefits, ''] });
    };

    const removeBenefit = (index) => {
        const newBenefits = formData.benefits.filter((_, i) => i !== index);
        setFormData({ ...formData, benefits: newBenefits });
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImage(file);
            setMainImagePreview(URL.createObjectURL(file));
        }
    };

    const handleAdditionalImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + additionalImages.length > 3) {
            toast.error('You can upload maximum 3 additional images');
            return;
        }

        setAdditionalImages([...additionalImages, ...files]);

        const newPreviews = files.map(file => URL.createObjectURL(file));
        setAdditionalImagePreviews([...additionalImagePreviews, ...newPreviews]);
    };

    const removeAdditionalImage = (index) => {
        // Check if we're removing an existing image or a newly uploaded one
        if (index < additionalImagePreviews.length - additionalImages.length) {
            // Existing image (from product.images)
            const newPreviews = [...additionalImagePreviews];
            newPreviews.splice(index, 1);
            setAdditionalImagePreviews(newPreviews);
        } else {
            // Newly uploaded image
            const newImages = [...additionalImages];
            newImages.splice(index - (additionalImagePreviews.length - additionalImages.length), 1);
            setAdditionalImages(newImages);

            const newPreviews = [...additionalImagePreviews];
            newPreviews.splice(index, 1);
            setAdditionalImagePreviews(newPreviews);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || !formData.price || !formData.category) {
            toast.error('Please fill in all required fields');
            return;
        }

        const productData = new FormData();
        productData.append('name', formData.name);
        productData.append('price', formData.price);
        productData.append('originalPrice', formData.originalPrice || formData.price);
        productData.append('category', formData.category);
        productData.append('description', formData.description);
        productData.append('dosage', formData.dosage);
        productData.append('isHot', formData.isHot);
        productData.append('isNew', formData.isNew);
        productData.append('stock', formData.stock);

        if (mainImage) {
            productData.append('image', mainImage);
        }

        formData.benefits.forEach(benefit => {
            if (benefit.trim()) productData.append('benefits[]', benefit);
        });

        additionalImages.forEach(image => {
            productData.append('images', image);
        });

        try {
            await dispatch(updateProduct({ id, updatedData: productData })).unwrap();
            toast.success('Product updated successfully!');
            navigate('/dashboard/products/all');
        } catch (error) {
            toast.error(error.message || 'Failed to update product');
        }
    };

    if (isLoading && !product) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Edit Product</h1>
                <button
                    onClick={() => navigate('/dashboard/products/all')}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                    Back to Products
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Pricing */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price ($) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Original Price ($)
                                </label>
                                <input
                                    type="number"
                                    name="originalPrice"
                                    min="0"
                                    step="0.01"
                                    value={formData.originalPrice}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Stock */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="stock"
                                min="0"
                                value={formData.stock}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {/* Status Flags */}
                        <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    name="isHot"
                                    checked={formData.isHot}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Hot Product</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="checkbox"
                                    name="isNew"
                                    checked={formData.isNew}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">New Arrival</span>
                            </label>
                        </div>
                    </div>

                    {/* Right Column - Image Uploads */}
                    <div className="space-y-6">
                        {/* Main Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Main Image
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    {mainImagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={mainImagePreview}
                                                alt="Main product preview"
                                                className="mx-auto h-40 object-contain"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMainImage(null);
                                                    setMainImagePreview('');
                                                }}
                                                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-center">
                                                <UploadCloud className="h-12 w-12 text-gray-400" />
                                            </div>
                                            <div className="flex text-sm text-gray-600">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                    <span>Upload a file</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleMainImageChange}
                                                        className="sr-only"
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG up to 5MB
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Images */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Additional Images (max 3)
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    {additionalImagePreviews.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {additionalImagePreviews.map((preview, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={preview}
                                                        alt={`Additional preview ${index + 1}`}
                                                        className="h-20 w-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAdditionalImage(index)}
                                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {additionalImagePreviews.length < 3 && (
                                                <div className="border border-gray-300 rounded-md flex items-center justify-center">
                                                    <label className="cursor-pointer p-2">
                                                        <Plus className="h-5 w-5 text-gray-400" />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleAdditionalImagesChange}
                                                            className="sr-only"
                                                            multiple
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-center">
                                                <UploadCloud className="h-12 w-12 text-gray-400" />
                                            </div>
                                            <div className="flex text-sm text-gray-600">
                                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                    <span>Upload files</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleAdditionalImagesChange}
                                                        className="sr-only"
                                                        multiple
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG up to 5MB each (max 3)
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Dosage */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage Instructions
                    </label>
                    <input
                        type="text"
                        name="dosage"
                        value={formData.dosage}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Benefits */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Benefits
                    </label>
                    <div className="space-y-2">
                        {formData.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center">
                                <input
                                    type="text"
                                    value={benefit}
                                    onChange={(e) => handleBenefitChange(index, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`Benefit ${index + 1}`}
                                />
                                {formData.benefits.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeBenefit(index)}
                                        className="ml-2 p-2 text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addBenefit}
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Another Benefit
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            isLoading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLoading ? 'Updating...' : 'Update Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProductPage;