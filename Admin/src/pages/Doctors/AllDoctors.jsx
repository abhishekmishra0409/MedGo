import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getAllDoctors,
    deleteDoctor,
    resetDoctorState,
    createDoctor,
    updateDoctor,
    updateDoctorApproval
} from '../../features/Doctors/DoctorSlice.js';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    User,
    Phone,
    Mail,
    Clock,
    MapPin,
    GraduationCap,
    BookOpen,
    CalendarDays,
    ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import DoctorModal from './DoctorFormModal.jsx';

const APPROVAL_STATUSES = ['pending', 'approved', 'rejected'];

const DoctorsPage = () => {
    const dispatch = useDispatch();
    const {
        doctors,
        isLoading,
        isError,
        isSuccess,
        message
    } = useSelector((state) => state.doctor);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [expandedDoctor, setExpandedDoctor] = useState(null);
    const [statusDrafts, setStatusDrafts] = useState({});

    useEffect(() => {
        dispatch(getAllDoctors());

        return () => {
            dispatch(resetDoctorState());
        };
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
        if (isSuccess && message) {
            toast.success(message);
        }
    }, [isError, isSuccess, message]);

    useEffect(() => {
        const initialStatusDrafts = {};
        doctors.forEach((doctor) => {
            initialStatusDrafts[doctor._id] = doctor.approvalStatus || 'approved';
        });
        setStatusDrafts(initialStatusDrafts);
    }, [doctors]);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this doctor?')) {
            dispatch(deleteDoctor(id));
            toast.success('Doctor deleted Successfully');
        }
    };

    const toggleExpand = (id) => {
        setExpandedDoctor(expandedDoctor === id ? null : id);
    };

    const filteredDoctors = doctors.filter((doctor) => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        const doctorStatus = doctor.approvalStatus || 'approved';

        const matchesSearch =
            !normalizedSearch ||
            (doctor.name || '').toLowerCase().includes(normalizedSearch) ||
            (doctor.specialty || '').toLowerCase().includes(normalizedSearch) ||
            (doctor.contact?.email || '').toLowerCase().includes(normalizedSearch) ||
            (doctor.contact?.phone || '').toLowerCase().includes(normalizedSearch);

        const matchesStatus = statusFilter === 'all' || doctorStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleSubmitDoctor = async ({ id, updatedData }) => {
        try {
            if (id) {
                await dispatch(updateDoctor({ id, updatedData })).unwrap();
                toast.success('Doctor Updated Successfully');
            } else {
                await dispatch(createDoctor({ ...updatedData, password: '123456' })).unwrap();
                toast.success('Doctor Created Successfully');
            }

            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.message || 'Failed to save doctor');
        }
    };

    const handleApproval = async (doctorId, approvalStatus) => {
        try {
            await dispatch(updateDoctorApproval({ id: doctorId, approvalStatus })).unwrap();
            toast.success(`Doctor ${approvalStatus} successfully`);
        } catch (error) {
            toast.error(error.message || 'Failed to update approval');
        }
    };

    const handleStatusDraftChange = (doctorId, approvalStatus) => {
        setStatusDrafts((prev) => ({
            ...prev,
            [doctorId]: approvalStatus,
        }));
    };

    const handleStatusUpdate = async (doctorId, currentStatus) => {
        const selectedStatus = statusDrafts[doctorId] || currentStatus || 'approved';
        const normalizedCurrentStatus = currentStatus || 'approved';

        if (selectedStatus === normalizedCurrentStatus) {
            toast('Status is already up to date');
            return;
        }

        await handleApproval(doctorId, selectedStatus);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not available';

        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Doctors Management</h1>
                <button
                    onClick={() => {
                        setSelectedDoctor(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Doctor
                </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="relative md:col-span-3">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search doctors by name, specialty, email or phone..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Approval Filter
                    </label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm leading-5 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Statuses</option>
                        {APPROVAL_STATUSES.map((status) => (
                            <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Doctors List */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredDoctors.length > 0 ? (
                        filteredDoctors.map((doctor) => (
                            <div key={doctor._id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                {doctor.image ? (
                                                    <img
                                                        className="h-20 w-20 rounded-full object-cover"
                                                        src={doctor.image}
                                                        alt={doctor.name}
                                                    />
                                                ) : (
                                                    <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <User className="h-10 w-10 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2">
                                                    <h2 className="text-lg font-bold text-gray-900">{doctor.name}</h2>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        {doctor.specialty}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doctor.approvalStatus === 'approved'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : doctor.approvalStatus === 'rejected'
                                                                ? 'bg-rose-100 text-rose-700'
                                                                : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {doctor.approvalStatus || 'approved'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">{doctor.qualification}</p>

                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {doctor.specializations?.map((spec, index) => (
                                                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                            {spec}
                                                        </span>
                                                    ))}
                                                </div>

                                                <div className="mt-3 flex items-center text-sm text-gray-500">
                                                    <Phone className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                    {doctor.contact?.phone}
                                                </div>
                                                <div className="mt-1 flex items-center text-sm text-gray-500">
                                                    <Mail className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                    {doctor.contact?.email}
                                                </div>
                                                {doctor.contact?.address && (
                                                    <div className="mt-1 flex items-center text-sm text-gray-500">
                                                        <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                        {doctor.contact.address}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-end gap-2">
                                            <select
                                                value={statusDrafts[doctor._id] || doctor.approvalStatus || 'approved'}
                                                onChange={(e) => handleStatusDraftChange(doctor._id, e.target.value)}
                                                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {APPROVAL_STATUSES.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleStatusUpdate(doctor._id, doctor.approvalStatus)}
                                                className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                                            >
                                                Update Status
                                            </button>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                <span className="inline-flex items-center">
                                                    <CalendarDays className="mr-1.5 h-4 w-4 text-gray-400" />
                                                    Joined {formatDate(doctor.createdAt)}
                                                </span>
                                                <span className="inline-flex items-center">
                                                    <ShieldCheck className="mr-1.5 h-4 w-4 text-gray-400" />
                                                    {doctor.role || 'doctor'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex justify-between items-center">
                                        <button
                                            onClick={() => toggleExpand(doctor._id)}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            {expandedDoctor === doctor._id ? 'Hide Details' : 'View Full Profile'}
                                        </button>

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedDoctor(doctor);
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                                                title="Edit"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(doctor._id)}
                                                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {expandedDoctor === doctor._id && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Working Hours */}
                                                {doctor.workingHours?.length > 0 && (
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-900 flex items-center">
                                                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                                            Working Hours
                                                        </h3>
                                                        <ul className="mt-2 space-y-1">
                                                            {doctor.workingHours.map((wh, index) => (
                                                                <li key={index} className="text-sm text-gray-600">
                                                                    <span className="font-medium">{wh.days}:</span> {wh.hours}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Education */}
                                                {doctor.education?.length > 0 && (
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-900 flex items-center">
                                                            <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                                                            Education
                                                        </h3>
                                                        <ul className="mt-2 space-y-1">
                                                            {doctor.education.map((edu, index) => (
                                                                <li key={index} className="text-sm text-gray-600">
                                                                    {edu}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Biography */}
                                                {doctor.biography?.length > 0 && (
                                                    <div className="md:col-span-2">
                                                        <h3 className="text-sm font-medium text-gray-900 flex items-center">
                                                            <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                                                            Biography
                                                        </h3>
                                                        <ul className="mt-2 space-y-1">
                                                            {doctor.biography.map((bio, index) => (
                                                                <li key={index} className="text-sm text-gray-600">
                                                                    • {bio}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
                            <p className="text-gray-500">
                                {searchTerm || statusFilter !== 'all' ? 'No doctors match your filters' : 'No doctors found'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Doctor Modal */}
            <DoctorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                doctor={selectedDoctor}
                onSubmit={handleSubmitDoctor}
                isLoading={isLoading}
            />
        </div>
    );
};

export default DoctorsPage;
