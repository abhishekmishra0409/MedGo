import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getClinics,
    resetClinicState,
    createClinic,
    updateClinic,
    addDoctorToClinic,
    removeDoctorFromClinic
} from '../../features/Clinics/ClinicSlice';
import { getAllDoctors } from '../../features/Doctors/DoctorSlice';
import {
    Search,
    Plus,
    Edit,
    Building,
    Phone,
    Mail,
    MapPin,
    Clock,
    Calendar,
    User,
    X,
    ChevronDown,
    ChevronUp,
    Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import ClinicModal from './ClinicModal';

const ClinicPage = () => {
    const dispatch = useDispatch();
    const {
        clinics,
        isLoading: isClinicLoading,
        isError: isClinicError,
        isSuccess: isClinicSuccess,
        message: clinicMessage
    } = useSelector((state) => state.clinic);

    const {
        doctors: allDoctors,
        isLoading: isDoctorLoading
    } = useSelector((state) => state.doctor);

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [expandedClinic, setExpandedClinic] = useState(null);
    const [showAddDoctor, setShowAddDoctor] = useState(null);
    const [selectedDoctorId, setSelectedDoctorId] = useState('');

    useEffect(() => {
        dispatch(getClinics());
        dispatch(getAllDoctors());

        return () => {
            dispatch(resetClinicState());
        };
    }, [dispatch]);

    useEffect(() => {
        if (isClinicError) {
            toast.error(clinicMessage);
        }
        if (isClinicSuccess && clinicMessage) {
            toast.success(clinicMessage);
        }
    }, [isClinicError, isClinicSuccess, clinicMessage]);

    const filteredClinics = clinics.filter(clinic =>
        clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.contact?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.contact?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || " "
    );

    const handleSubmitClinic = async ({ id, clinicData }) => {
        try {
            if (id) {
                await dispatch(updateClinic({ id, clinicData })).unwrap();
                toast.success('Clinic Updated Successfully');
            } else {
                await dispatch(createClinic(clinicData)).unwrap();
                toast.success('Clinic Register Successfully');
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.message || 'Failed to save clinic');
        }
    };

    const handleAddDoctor = async (clinicId) => {
        if (!selectedDoctorId) {
            toast.error('Please select a doctor');
            return;
        }
        const doctorData = {
            doctorId: selectedDoctorId
        }

        try {
            await dispatch(addDoctorToClinic({ clinicId, doctorData })).unwrap();
            setShowAddDoctor(null);
            setSelectedDoctorId('');
            toast.success('Doctor added successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to add doctor');
        }
    };

    const handleRemoveDoctor = async (clinicId, doctorId) => {
        if (window.confirm('Are you sure you want to remove this doctor from the clinic?')) {
            try {
                await dispatch(removeDoctorFromClinic({ clinicId, doctorId })).unwrap();
                toast.success('Doctor removed successfully');
            } catch (error) {
                toast.error(error.message || 'Failed to remove doctor');
            }
        }
    };

    const formatTime = (time) => {
        if (!time) return 'Closed';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const toggleExpand = (id) => {
        setExpandedClinic(expandedClinic === id ? null : id);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Clinics Management</h1>
                <button
                    onClick={() => {
                        setSelectedClinic(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Clinic
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search clinics by name, city, email or phone..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Clinics List */}
            {isClinicLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredClinics.length > 0 ? (
                        filteredClinics.map((clinic) => (
                            <div key={clinic._id} className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <Building className="h-8 w-8 text-blue-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h2 className="text-lg font-bold text-gray-900">{clinic.name}</h2>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {clinic.address.street}, {clinic.address.city}
                                                </p>

                                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                                    <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                    {clinic.contact?.phone}
                                                </div>
                                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                                    <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                    {clinic.contact?.email}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => toggleExpand(clinic._id)}
                                                className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50"
                                            >
                                                {expandedClinic === clinic._id ? (
                                                    <ChevronUp className="h-5 w-5" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedClinic(clinic);
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                                                title="Edit"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {expandedClinic === clinic._id && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Operating Hours */}
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Operating Hours</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">Weekdays:</span>
                                                            <span className="text-sm font-medium">
                                                                {formatTime(clinic.operatingHours?.weekdays?.open)} - {formatTime(clinic.operatingHours?.weekdays?.close)}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">Weekends:</span>
                                                            <span className="text-sm font-medium">
                                                                {clinic.operatingHours?.weekends?.open ?
                                                                    `${formatTime(clinic.operatingHours.weekends.open)} - ${formatTime(clinic.operatingHours.weekends.close)}` :
                                                                    'Closed'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Appointment Settings */}
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Appointment Settings</h3>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">Slot Duration:</span>
                                                            <span className="text-sm font-medium">
                                                                {clinic.appointmentSettings?.slotDuration} minutes
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-sm text-gray-600">Max Daily Appointments:</span>
                                                            <span className="text-sm font-medium">
                                                                {clinic.appointmentSettings?.maxDailyAppointments}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Facilities */}
                                                {clinic.facilities?.length > 0 && (
                                                    <div className="md:col-span-2">
                                                        <h3 className="text-sm font-medium text-gray-700 mb-2">Facilities</h3>
                                                        <div className="flex flex-wrap gap-2">
                                                            {clinic.facilities.map((facility, index) => (
                                                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                    {facility}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Doctors */}
                                                <div className="md:col-span-2">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h3 className="text-sm font-medium text-gray-700">Doctors ({clinic.doctors?.length || 0})</h3>
                                                        <button
                                                            onClick={() => setShowAddDoctor(showAddDoctor === clinic._id ? null : clinic._id)}
                                                            className="text-sm text-blue-600 hover:text-blue-800"
                                                        >
                                                            {showAddDoctor === clinic._id ? 'Cancel' : 'Add Doctor'}
                                                        </button>
                                                    </div>

                                                    {showAddDoctor === clinic._id && (
                                                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                                                            {isDoctorLoading ? (
                                                                <div className="text-center py-2">Loading doctors...</div>
                                                            ) : (
                                                                <>
                                                                    <select
                                                                        value={selectedDoctorId}
                                                                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                                                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border mb-2"
                                                                    >
                                                                        <option value="">Select a doctor</option>
                                                                        {allDoctors
                                                                            .filter(doctor => !clinic.doctors?.some(d => d._id === doctor._id))
                                                                            .map(doctor => (
                                                                                <option key={doctor._id} value={doctor._id}>
                                                                                    {doctor.name} ({doctor.specialty})
                                                                                </option>
                                                                            ))}
                                                                    </select>
                                                                    <button
                                                                        onClick={() => handleAddDoctor(clinic._id)}
                                                                        className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                                                                        disabled={!selectedDoctorId}
                                                                    >
                                                                        Add Doctor
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    )}

                                                    {clinic.doctors?.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {clinic.doctors.map((doctor) => (
                                                                <div key={doctor._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                                                                    <div className="flex items-center">
                                                                        {doctor.image ? (
                                                                            <img
                                                                                src={doctor.image}
                                                                                alt={doctor.name}
                                                                                className="h-10 w-10 rounded-full object-cover mr-3"
                                                                            />
                                                                        ) : (
                                                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                                                                                <User className="h-5 w-5 text-gray-400" />
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <p className="text-sm font-medium">{doctor.name}</p>
                                                                            <p className="text-xs text-gray-500">{doctor.specialty}</p>
                                                                        </div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleRemoveDoctor(clinic._id, doctor._id)}
                                                                        className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                                                                        title="Remove Doctor"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">No doctors assigned yet</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
                            <p className="text-gray-500">
                                {searchTerm ? 'No clinics match your search' : 'No clinics found'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Clinic Modal */}
            <ClinicModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                clinic={selectedClinic}
                onSubmit={handleSubmitClinic}
                isLoading={isClinicLoading}
            />
        </div>
    );
};

export default ClinicPage;