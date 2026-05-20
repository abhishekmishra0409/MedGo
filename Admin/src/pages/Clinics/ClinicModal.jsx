import { useState, useEffect } from 'react';
import {
    Building,
    Phone,
    Mail,
    MapPin,
    Clock,
    Calendar,
    X
} from 'lucide-react';

const ClinicModal = ({
                         isOpen,
                         onClose,
                         clinic,
                         onSubmit,
                         isLoading
                     }) => {
    const [formData, setFormData] = useState({
        name: '',
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'INDIA'
        },
        contact: {
            phone: '',
            email: ''
        },
        operatingHours: {
            weekdays: {
                open: '09:00',
                close: '18:00'
            },
            weekends: {
                open: '',
                close: ''
            }
        },
        appointmentSettings: {
            slotDuration: 30,
            maxDailyAppointments: 20
        },
        facilities: [],
        isActive: true
    });

    const [newFacility, setNewFacility] = useState('');

    useEffect(() => {
        if (clinic) {
            setFormData({
                name: clinic.name || '',
                address: {
                    street: clinic.address?.street || '',
                    city: clinic.address?.city || '',
                    state: clinic.address?.state || '',
                    postalCode: clinic.address?.postalCode || '',
                    country: clinic.address?.country || 'INDIA'
                },
                contact: {
                    phone: clinic.contact?.phone || '',
                    email: clinic.contact?.email || ''
                },
                operatingHours: {
                    weekdays: {
                        open: clinic.operatingHours?.weekdays?.open || '09:00',
                        close: clinic.operatingHours?.weekdays?.close || '18:00'
                    },
                    weekends: {
                        open: clinic.operatingHours?.weekends?.open || '',
                        close: clinic.operatingHours?.weekends?.close || ''
                    }
                },
                appointmentSettings: {
                    slotDuration: clinic.appointmentSettings?.slotDuration || 30,
                    maxDailyAppointments: clinic.appointmentSettings?.maxDailyAppointments || 20
                },
                facilities: clinic.facilities || [],
                isActive: clinic.isActive !== undefined ? clinic.isActive : true
            });
        } else {
            setFormData({
                name: '',
                address: {
                    street: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'INDIA'
                },
                contact: {
                    phone: '',
                    email: ''
                },
                operatingHours: {
                    weekdays: {
                        open: '09:00',
                        close: '18:00'
                    },
                    weekends: {
                        open: '',
                        close: ''
                    }
                },
                appointmentSettings: {
                    slotDuration: 30,
                    maxDailyAppointments: 20
                },
                facilities: [],
                isActive: true
            });
        }
    }, [clinic]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child, subChild] = name.split('.');

            if (subChild) {
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: {
                            ...prev[parent][child],
                            [subChild]: value
                        }
                    }
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAddFacility = () => {
        if (newFacility.trim() && !formData.facilities.includes(newFacility.trim())) {
            setFormData(prev => ({
                ...prev,
                facilities: [...prev.facilities, newFacility.trim()]
            }));
            setNewFacility('');
        }
    };

    const handleRemoveFacility = (index) => {
        setFormData(prev => ({
            ...prev,
            facilities: prev.facilities.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Clean up empty weekend hours
        const cleanedData = {
            ...formData,
            operatingHours: {
                weekdays: formData.operatingHours.weekdays,
                weekends: formData.operatingHours.weekends.open ?
                    formData.operatingHours.weekends :
                    { open: '', close: '' }
            }
        };

        onSubmit({
            id: clinic?._id,
            clinicData: cleanedData
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Clinic profile</p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-950">
                            {clinic ? 'Edit Clinic' : 'Add New Clinic'}
                        </h2>
                    </div>
                        <button
                            onClick={onClose}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                            <X className="h-5 w-5" />
                        </button>
                </div>

                <div className="admin-scroll flex-1 overflow-y-auto p-5">

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Clinic Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Building className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Street Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="address.street"
                                            value={formData.address.street}
                                            onChange={handleChange}
                                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        name="address.state"
                                        value={formData.address.state}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Postal Code
                                    </label>
                                    <input
                                        type="text"
                                        name="address.postalCode"
                                        value={formData.address.postalCode}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        name="address.country"
                                        value={formData.address.country}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Contact and Hours */}
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
                                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
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
                                            name="contact.email"
                                            value={formData.contact.email}
                                            onChange={handleChange}
                                            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-medium text-gray-700 flex items-center mb-2">
                                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                        Weekday Hours
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Open</label>
                                            <input
                                                type="time"
                                                name="operatingHours.weekdays.open"
                                                value={formData.operatingHours.weekdays.open}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Close</label>
                                            <input
                                                type="time"
                                                name="operatingHours.weekdays.close"
                                                value={formData.operatingHours.weekdays.close}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-medium text-gray-700 flex items-center mb-2">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                        Weekend Hours
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Open</label>
                                            <input
                                                type="time"
                                                name="operatingHours.weekends.open"
                                                value={formData.operatingHours.weekends.open}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Close</label>
                                            <input
                                                type="time"
                                                name="operatingHours.weekends.close"
                                                value={formData.operatingHours.weekends.close}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                                        Appointment Settings
                                    </h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Slot Duration (min)</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[15, 30, 45, 60].map((duration) => (
                                                    <button
                                                        key={duration}
                                                        type="button"
                                                        onClick={() => {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                appointmentSettings: {
                                                                    ...prev.appointmentSettings,
                                                                    slotDuration: duration
                                                                }
                                                            }));
                                                        }}
                                                        className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                                                            Number(formData.appointmentSettings.slotDuration) === duration
                                                                ? 'border-teal-200 bg-teal-50 text-teal-800'
                                                                : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200'
                                                        }`}
                                                    >
                                                        {duration}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Max Daily Appointments</label>
                                            <input
                                                type="number"
                                                min="1"
                                                name="appointmentSettings.maxDailyAppointments"
                                                value={formData.appointmentSettings.maxDailyAppointments}
                                                onChange={handleChange}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Facilities */}
                        <div className="mb-4 border-t pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Facilities
                                </label>
                            </div>
                            <div className="flex mb-2">
                                <input
                                    type="text"
                                    placeholder="Add facility (e.g., Pharmacy, X-Ray)"
                                    value={newFacility}
                                    onChange={(e) => setNewFacility(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm p-2 border"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddFacility}
                                    className="ml-2 px-3 py-1 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.facilities.map((facility, index) => (
                                    <div key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                        {facility}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveFacility(index)}
                                            className="ml-1 text-green-600 hover:text-green-900"
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Processing...' : clinic ? 'Update Clinic' : 'Add Clinic'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ClinicModal;
