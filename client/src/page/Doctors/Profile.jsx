import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CommonProfile from "../../component/Profile/CommonProfile.jsx";
import { getDoctorProfile, updateDoctorProfile } from "../../features/Doctor/DoctorSlice.js";
import { authService } from "../../features/User/UserService.js";

const DoctorsProfile = () => {
    const dispatch = useDispatch();
    const { profile, isLoading } = useSelector((state) => state.doctor);

    useEffect(() => {
        dispatch(getDoctorProfile());
    }, [dispatch]);

    const handleSave = async (payload) => {
        const result = await dispatch(updateDoctorProfile(payload));
        if (updateDoctorProfile.fulfilled.match(result)) {
            dispatch(getDoctorProfile());
            return true;
        }

        return false;
    };

    const handleUploadAvatar = async (file) => {
        const response = await authService.uploadDoctorProfileImage(file);
        return response?.data?.url;
    };

    return (
        <div className="space-y-5">
            <CommonProfile
                profile={profile || {}}
                roleLabel="Doctor"
                isLoading={isLoading}
                onSave={handleSave}
                onUploadAvatar={handleUploadAvatar}
            />

            <div className="grid gap-4 lg:grid-cols-2">
                <Link
                    to="/doctor/professional-details"
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Doctor only</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-950">Professional details</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">Manage specialty, qualification, education, biography, and patient-facing profile content.</p>
                </Link>
                <Link
                    to="/doctor/availability"
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Scheduling</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-950">Availability</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">View, add, remove, and update the working-hour slots patients can use.</p>
                </Link>
            </div>
        </div>
    );
};

export default DoctorsProfile;
