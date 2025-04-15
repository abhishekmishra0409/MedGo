import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../features/Products/ProductSlice.js';
import { UploadCloud, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateProductPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Form state matching Postman fields exactly
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        originalPrice: '',
        category: '',
        description: '',
        benefits: ['', ''], // Default two benefit fields as shown in Postman
        dosage: '',
        isHot: '0', // String '0' or '1' to match Postman
        rating: '4.3', // Default value as shown
        reviews: '120', // Default value as shown
        stock: '',
        isNew: '0', // String '0' or '1' to match Postman
    });

    // File states
    const [mainImage, setMainImage] = useState(null);
    const [additionalImages, setAdditionalImages] = useState([]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
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
        setMainImage(e.target.files[0]);
    };

    const handleAdditionalImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            toast.error('Maximum 3 additional images allowed');
            return;
        }
        setAdditionalImages(files);
    };

    const removeAdditionalImage = (index) => {
        const newImages = additionalImages.filter((_, i) => i !== index);
        setAdditionalImages(newImages);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate required fields
        if (!formData.name || !formData.price || !formData.category || !mainImage) {
            toast.error('Please fill all required fields');
            setIsLoading(false);
            return;
        }

        // Prepare FormData exactly as Postman shows
        const productFormData = new FormData();
        productFormData.append('name', formData.name);
        productFormData.append('price', formData.price);
        productFormData.append('originalPrice', formData.originalPrice || formData.price);
        productFormData.append('category', formData.category);
        productFormData.append('description', formData.description);
        productFormData.append('dosage', formData.dosage);
        productFormData.append('isHot', formData.isHot);
        productFormData.append('rating', formData.rating);
        productFormData.append('reviews', formData.reviews);
        productFormData.append('stock', formData.stock);
        productFormData.append('isNew', formData.isNew);
        productFormData.append('image', mainImage);

        // Add benefits (only non-empty ones)
        formData.benefits.forEach((benefit, index) => {
            if (benefit.trim()) {
                productFormData.append(`benefits[${index}]`, benefit);
            }
        });

        // Add additional images
        additionalImages.forEach((image) => {
            productFormData.append('images', image);
        });

        try {
            await dispatch(createProduct(productFormData)).unwrap();
            toast.success('Product created successfully!');
            navigate('/dashboard/products/all');
        } catch (error) {
            toast.error(error.message || 'Failed to create product');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Product</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Original Price
                                </label>
                                <input
                                    type="number"
                                    name="originalPrice"
                                    value={formData.originalPrice}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rating
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="rating"
                                    value={formData.rating}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Reviews
                                </label>
                                <input
                                    type="number"
                                    name="reviews"
                                    value={formData.reviews}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border rounded-md"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-6">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isHot"
                                    checked={formData.isHot === '1'}
                                    onChange={(e) => setFormData({...formData, isHot: e.target.checked ? '1' : '0'})}
                                    className="h-4 w-4 rounded"
                                />
                                <span className="ml-2 text-sm">Hot Product</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isNew"
                                    checked={formData.isNew === '1'}
                                    onChange={(e) => setFormData({...formData, isNew: e.target.checked ? '1' : '0'})}
                                    className="h-4 w-4 rounded"
                                />
                                <span className="ml-2 text-sm">New Arrival</span>
                            </label>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Main Image <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-dashed rounded-md p-4 text-center">
                                {mainImage ? (
                                    <div className="relative">
                                        <img
                                            src={URL.createObjectURL(mainImage)}
                                            alt="Preview"
                                            className="h-40 mx-auto object-contain"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setMainImage(null)}
                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer">
                                        <div className="flex flex-col items-center justify-center">
                                            <UploadCloud className="h-10 w-10 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-600">
                                                Click to upload main image
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            name="image"
                                            onChange={handleMainImageChange}
                                            className="hidden"
                                            required
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Additional Images (max 5)
                            </label>
                            <div className="border-2 border-dashed rounded-md p-4 text-center">
                                {additionalImages.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-2">
                                        {additionalImages.map((file, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Additional ${index + 1}`}
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
                                        {additionalImages.length < 3 && (
                                            <label className="border rounded-md flex items-center justify-center h-20 cursor-pointer">
                                                <Plus className="h-5 w-5 text-gray-400" />
                                                <input
                                                    type="file"
                                                    name="images"
                                                    onChange={handleAdditionalImagesChange}
                                                    className="hidden"
                                                    multiple
                                                />
                                            </label>
                                        )}
                                    </div>
                                ) : (
                                    <label className="cursor-pointer">
                                        <div className="flex flex-col items-center justify-center">
                                            <UploadCloud className="h-10 w-10 text-gray-400" />
                                            <p className="mt-2 text-sm text-gray-600">
                                                Click to upload additional images
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            name="images"
                                            onChange={handleAdditionalImagesChange}
                                            className="hidden"
                                            multiple
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage
                    </label>
                    <input
                        type="text"
                        name="dosage"
                        value={formData.dosage}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>

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
                                    className="flex-1 px-3 py-2 border rounded-md"
                                    placeholder={`Benefit ${index + 1}`}
                                />
                                {formData.benefits.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeBenefit(index)}
                                        className="ml-2 p-2 text-red-500"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addBenefit}
                            className="flex items-center text-sm text-blue-600 mt-2"
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Benefit
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                            isLoading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLoading ? 'Creating...' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProductPage;