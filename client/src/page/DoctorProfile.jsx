import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchDoctorById } from "../features/Doctor/DoctorSlice.js";
import { fetchClinicsByDoctor } from "../features/Clinic/ClinicSlice.js";

const DoctorProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const dispatch = useDispatch();

    const { doctor, isLoading, isError } = useSelector((state) => state.doctor);
    const { doctorClinics } = useSelector((state) => state.clinic);

    const handleButtonClick = () => {
        navigate(`/appointment/${id}`);
    };

    useEffect(() => {
        dispatch(fetchDoctorById(id));
        dispatch(fetchClinicsByDoctor(id));
    }, [dispatch, id]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-8 bg-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
            </div>
        );
    }

    if (isError || !doctor) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-8 bg-white text-center">
                <h1 className="text-2xl font-bold text-gray-800">Doctor not found</h1>
                <p className="text-gray-600 mt-2">The requested doctor profile does not exist</p>
            </div>
        );
    }

    return (
        <div className="section-shell py-10">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="surface-card">
                    <div className="flex flex-col items-center">
                        <img
                            src={doctor.image}
                            alt={doctor.name}
                            className="aspect-square h-auto w-full max-w-80 rounded-lg object-cover"
                        />
                        <h2 className="text-2xl font-bold mt-4 text-gray-800">{doctor.name}</h2>
                        <p className="text-teal-600 text-lg">{doctor.specialty || "Specialist"}</p>
                        <p className="text-gray-500 text-sm text-center">{doctor.qualification || "Qualification not added"}</p>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Info</h3>
                        <div className="space-y-2 text-gray-600">
                            <p className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {doctor.contact?.phone || "Not provided"}
                            </p>
                            <p className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {doctor.contact?.email || "Not provided"}
                            </p>
                            <p className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {doctor.contact?.address || "Not provided"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Working Hours</h3>
                        <div className="space-y-2">
                            {(doctor.workingHours || []).map((item, index) => (
                                <div key={index} className="flex flex-col gap-1 text-gray-600 sm:flex-row sm:justify-between">
                                    <span>{item.days}</span>
                                    <span className="font-medium">{item.hours}</span>
                                </div>
                            ))}
                            {!doctor.workingHours?.length ? (
                                <p className="text-sm text-slate-500">Working hours are not available.</p>
                            ) : null}
                        </div>
                    </div>

                    <button className="btn-primary mt-6 w-full rounded-2xl px-4 py-3 font-medium" onClick={handleButtonClick}>
                        Book an Appointment
                    </button>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="surface-card">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Availability snapshot</h2>
                        {doctorClinics?.length ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {doctorClinics.slice(0, 4).map((clinic) => (
                                    <div key={clinic._id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                                        <p className="font-semibold text-slate-950">{clinic.name}</p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            {clinic.address?.street}, {clinic.address?.city}
                                        </p>
                                        <div className="mt-3 text-sm text-slate-600">
                                            <p>Weekdays: {clinic.operatingHours?.weekdays?.open} - {clinic.operatingHours?.weekdays?.close}</p>
                                            <p>Weekends: {clinic.operatingHours?.weekends?.open} - {clinic.operatingHours?.weekends?.close}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-600">Clinic availability details will appear here when locations are assigned.</p>
                        )}
                    </div>

                    <div className="surface-card">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Biography</h2>
                            <div className="space-y-3 text-gray-600">
                                {(doctor.biography || []).map((para, index) => (
                                    <p key={index}>{para}</p>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Education</h2>
                            <ul className="space-y-2 text-gray-600">
                                {(doctor.education || []).map((degree, index) => (
                                    <li key={index} className="flex items-start">
                                        <svg className="w-5 h-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span>{degree}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Specializations</h2>
                            <div className="flex flex-wrap gap-2">
                                {doctor.specializations?.map((spec, index) => (
                                    <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;
