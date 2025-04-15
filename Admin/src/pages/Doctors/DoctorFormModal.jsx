import { useState, useEffect } from 'react';
import {
    User,
    Phone,
    Mail,
    BriefcaseMedical,
    Clock,
    MapPin,
    GraduationCap,
    BookOpen,
    X,
    Upload,
    Image as ImageIcon
} from 'lucide-react';

const DoctorModal = ({
                         isOpen,
                         onClose,
                         doctor,
                         onSubmit,
                         isLoading
                     }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        specialty: '',
        qualification: '',
        image: '',
        contact: {
            phone: '',
            email: '',
            address: ''
        },
        workingHours: [
            { days: '', hours: '' }
        ],
        education: [''],
        biography: [''],
        specializations: [''],
        rating: 0,
        reviews: 0
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        if (doctor) {
            setFormData({
                name: doctor.name || '',
                email: doctor.email || '',
                specialty: doctor.specialty || '',
                qualification: doctor.qualification || '',
                image: doctor.image || '',
                contact: {
                    phone: doctor.contact?.phone || '',
                    email: doctor.contact?.email || '',
                    address: doctor.contact?.address || ''
                },
                workingHours: doctor.workingHours?.length ?
                    doctor.workingHours.map(wh => ({
                        days: wh.days || '',
                        hours: wh.hours || ''
                    })) : [{ days: '', hours: '' }],
                education: doctor.education?.length ?
                    [...doctor.education] : [''],
                biography: doctor.biography?.length ?
                    [...doctor.biography] : [''],
                specializations: doctor.specializations?.length ?
                    [...doctor.specializations] : [''],
                rating: doctor.rating || 0,
                reviews: doctor.reviews || 0
            });
            if (doctor.image) {
                setImagePreview(doctor.image);
            }
        } else {
            setFormData({
                name: '',
                email: '',
                specialty: '',
                qualification: '',
                image: '',
                contact: {
                    phone: '',
                    email: '',
                    address: ''
                },
                workingHours: [
                    { days: '', hours: '' }
                ],
                education: [''],
                biography: [''],
                specializations: [''],
                rating: 0,
                reviews: 0
            });
        }
        setImageFile(null);
    }, [doctor]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('contact.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                contact: {
                    ...prev.contact,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleWorkingHoursChange = (index, field, value) => {
        const updatedHours = [...formData.workingHours];
        updatedHours[index][field] = value;
        setFormData(prev => ({
            ...prev,
            workingHours: updatedHours
        }));
    };

    const handleArrayFieldChange = (field, index, value) => {
        const updatedArray = [...formData[field]];
        updatedArray[index] = value;
        setFormData(prev => ({
            ...prev,
            [field]: updatedArray
        }));
    };

    const addArrayFieldItem = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeArrayFieldItem = (field, index) => {
        const updatedArray = formData[field].filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            [field]: updatedArray
        }));
    };

    const addWorkingHours = () => {
        setFormData(prev => ({
            ...prev,
            workingHours: [...prev.workingHours, { days: '', hours: '' }]
        }));
    };

    const removeWorkingHours = (index) => {
        const updatedHours = formData.workingHours.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            workingHours: updatedHours
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedData = {
            ...formData,
            education: formData.education.filter(item => item.trim() !== ''),
            biography: formData.biography.filter(item => item.trim() !== ''),
            specializations: formData.specializations.filter(item => item.trim() !== '')
        };

        onSubmit({
            id: doctor?._id,
            updatedData,
            imageFile
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">
                            {doctor ? 'Edit Doctor' : 'Add New Doctor'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Image Upload */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Doctor Image
                            </label>
                            <div className="flex items-center">
                                <div className="mr-4">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-20 w-20 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                                            <ImageIcon className="h-10 w-10 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <label className="flex flex-col items-center px-4 py-2 bg-white rounded-md border border-gray-300 shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                                        <div className="flex items-center">
                                            <Upload className="h-5 w-5 mr-2 text-gray-500" />
                                            <span>{imageFile ? 'Change Image' : 'Upload Image'}</span>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                    <p className="mt-1 text-xs text-gray-500">
                                        JPG, PNG up to 2MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Specialty
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <BriefcaseMedical className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="specialty"
                                            value={formData.specialty}
                                            onChange={handleChange}
                                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Qualification
                                    </label>
                                    <input
                                        type="text"
                                        name="qualification"
                                        value={formData.qualification}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="contact.phone"
                                            value={formData.contact.phone}
                                            onChange={handleChange}
                                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            name="contact.email"
                                            value={formData.contact.email}
                                            onChange={handleChange}
                                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="contact.address"
                                            value={formData.contact.address}
                                            onChange={handleChange}
                                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rating
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="5"
                                        step="0.1"
                                        name="rating"
                                        value={formData.rating}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reviews Count
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        name="reviews"
                                        value={formData.reviews}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Working Hours */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                    Working Hours
                                </label>
                                <button
                                    type="button"
                                    onClick={addWorkingHours}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Add Hours
                                </button>
                            </div>

                            {formData.workingHours.map((wh, index) => (
                                <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                                    <input
                                        type="text"
                                        placeholder="Days (e.g., Monday - Friday)"
                                        value={wh.days}
                                        onChange={(e) => handleWorkingHoursChange(index, 'days', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                    <div className="flex">
                                        <input
                                            type="text"
                                            placeholder="Hours (e.g., 9 AM - 5 PM)"
                                            value={wh.hours}
                                            onChange={(e) => handleWorkingHoursChange(index, 'hours', e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        />
                                        {formData.workingHours.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeWorkingHours(index)}
                                                className="ml-2 text-red-600 hover:text-red-800"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Education */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center">
                                    <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                                    Education
                                </label>
                                <button
                                    type="button"
                                    onClick={() => addArrayFieldItem('education')}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Add Education
                                </button>
                            </div>

                            {formData.education.map((edu, index) => (
                                <div key={index} className="flex mb-2">
                                    <input
                                        type="text"
                                        placeholder="Education (e.g., MBBS from Harvard)"
                                        value={edu}
                                        onChange={(e) => handleArrayFieldChange('education', index, e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                    {formData.education.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayFieldItem('education', index)}
                                            className="ml-2 text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Biography */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700 flex items-center">
                                    <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                                    Biography
                                </label>
                                <button
                                    type="button"
                                    onClick={() => addArrayFieldItem('biography')}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Add Biography
                                </button>
                            </div>

                            {formData.biography.map((bio, index) => (
                                <div key={index} className="flex mb-2">
                  <textarea
                      placeholder="Biography point (e.g., 10 years of experience)"
                      value={bio}
                      onChange={(e) => handleArrayFieldChange('biography', index, e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      rows="2"
                  />
                                    {formData.biography.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayFieldItem('biography', index)}
                                            className="ml-2 text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Specializations */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Specializations
                                </label>
                                <button
                                    type="button"
                                    onClick={() => addArrayFieldItem('specializations')}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Add Specialization
                                </button>
                            </div>

                            {formData.specializations.map((spec, index) => (
                                <div key={index} className="flex mb-2">
                                    <input
                                        type="text"
                                        placeholder="Specialization (e.g., Heart Surgery)"
                                        value={spec}
                                        onChange={(e) => handleArrayFieldChange('specializations', index, e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                    {formData.specializations.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeArrayFieldItem('specializations', index)}
                                            className="ml-2 text-red-600 hover:text-red-800"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : doctor ? 'Update Doctor' : 'Add Doctor'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DoctorModal;