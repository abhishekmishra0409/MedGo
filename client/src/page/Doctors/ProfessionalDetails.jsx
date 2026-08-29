import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Award, BadgeCheck, BookOpen, CalendarClock, GraduationCap, Star, Stethoscope } from "lucide-react";
import { getDoctorProfile, updateDoctorProfile } from "../../features/Doctor/DoctorSlice.js";

const toMultilineText = (items = []) => (items || []).filter(Boolean).join("\n");
const parseMultilineText = (value = "") =>
    value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

const buildFormFromProfile = (profile = {}) => ({
    specialty: profile.specialty || "",
    qualification: profile.qualification || "",
    councilRegistrationNumber: profile.councilRegistrationNumber || "",
    councilName: profile.councilName || "",
    practiceAddress: profile.contact?.address || "",
    contactEmail: profile.contact?.email || profile.email || "",
    image: profile.image || profile.avatar || "",
    biographyText: toMultilineText(profile.biography),
    educationText: toMultilineText(profile.education),
    specializationsText: toMultilineText(profile.specializations),
});

const ListBlock = ({ title, items, icon }) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            {icon}
            {title}
        </p>
        {items?.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {items.map((item, index) => (
                    <li key={`${item}-${index}`} className="rounded-xl bg-white px-3 py-2">
                        {item}
                    </li>
                ))}
            </ul>
        ) : (
            <p className="mt-3 text-sm text-slate-500">Not provided</p>
        )}
    </div>
);

const ProfessionalDetails = () => {
    const dispatch = useDispatch();
    const { profile, isLoading } = useSelector((state) => state.doctor);
    // A doctor attached to an approved clinic inherits its address and contact
    // details; only a solo practitioner needs to supply their own.
    const isSolo = profile?.clinicMembershipStatus !== "approved";
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(buildFormFromProfile(profile));
    const initials = (profile?.name || profile?.username || "D").slice(0, 1).toUpperCase();

    useEffect(() => {
        dispatch(getDoctorProfile());
    }, [dispatch]);

    useEffect(() => {
        setFormData(buildFormFromProfile(profile));
    }, [profile]);

    const professionalPreview = useMemo(
        () => ({
            biography: parseMultilineText(formData.biographyText),
            education: parseMultilineText(formData.educationText),
            specializations: parseMultilineText(formData.specializationsText),
        }),
        [formData.biographyText, formData.educationText, formData.specializationsText]
    );

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleCancel = () => {
        setFormData(buildFormFromProfile(profile));
        setIsEditing(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const result = await dispatch(updateDoctorProfile({
            avatar: formData.image,
            doctorProfile: {
                specialty: formData.specialty,
                qualification: formData.qualification,
                councilRegistrationNumber: formData.councilRegistrationNumber,
                councilName: formData.councilName,
                image: formData.image,
                contactEmail: formData.contactEmail,
                address: formData.practiceAddress,
                biography: professionalPreview.biography,
                education: professionalPreview.education,
                specializations: professionalPreview.specializations,
            },
        }));

        if (updateDoctorProfile.fulfilled.match(result)) {
            setIsEditing(false);
            dispatch(getDoctorProfile());
        }
    };

    if (isLoading && !profile) {
        return <div className="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">Loading professional details...</div>;
    }

    return (
        <div className="w-full space-y-5">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Doctor workspace</p>
                        <h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">Professional details</h1>
                        <p className="mt-1 text-sm leading-6 text-slate-500">Manage the doctor-only information patients see when booking care.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/doctor/availability" className="inline-flex items-center gap-2 rounded-2xl border border-teal-200 px-4 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-50">
                            <CalendarClock className="h-4 w-4" />
                            Availability
                        </Link>
                        {!isEditing ? (
                            <button type="button" onClick={() => setIsEditing(true)} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                                Edit details
                            </button>
                        ) : null}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[320px_1fr]">
                    <aside className="space-y-4 rounded-2xl bg-slate-50 p-4">
                        {formData.image ? (
                            <img
                                src={formData.image}
                                alt={profile?.name || "Doctor"}
                                className="h-56 w-full rounded-2xl object-cover"
                            />
                        ) : (
                            <div className="flex h-56 w-full items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-5xl font-semibold text-teal-700">
                                {initials}
                            </div>
                        )}
                        <div className="rounded-2xl bg-white p-4">
                            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <Star className="h-4 w-4 text-amber-500" />
                                Patient rating
                            </p>
                            <p className="mt-2 text-sm text-slate-600">{profile?.rating ?? 0} ({profile?.reviews ?? 0} reviews)</p>
                        </div>
                    </aside>

                    <div className="space-y-4">
                        {isEditing ? (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-medium text-slate-700">Specialty</span>
                                        <input name="specialty" value={formData.specialty} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-medium text-slate-700">Qualification</span>
                                        <input name="qualification" value={formData.qualification} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-medium text-slate-700">
                                            Medical council registration number
                                        </span>
                                        <input
                                            name="councilRegistrationNumber"
                                            value={formData.councilRegistrationNumber}
                                            onChange={handleChange}
                                            placeholder="e.g. MCI-12345"
                                            autoComplete="off"
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 focus-visible:ring-2 focus-visible:ring-teal-500"
                                        />
                                    </label>
                                    <label className="block">
                                        <span className="mb-1 block text-sm font-medium text-slate-700">Issuing council</span>
                                        <input
                                            name="councilName"
                                            value={formData.councilName}
                                            onChange={handleChange}
                                            placeholder="e.g. Madhya Pradesh Medical Council"
                                            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 focus-visible:ring-2 focus-visible:ring-teal-500"
                                        />
                                    </label>
                                </div>

                                <p className="rounded-2xl border border-teal-100 bg-teal-50/60 p-3 text-sm text-slate-600">
                                    Your registration number is what the platform verifies before approving your account. It is never shown to patients.
                                </p>

                                {isSolo ? (
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <label className="block">
                                            <span className="mb-1 block text-sm font-medium text-slate-700">Practice email</span>
                                            <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 focus-visible:ring-2 focus-visible:ring-teal-500" />
                                        </label>
                                        <label className="block">
                                            <span className="mb-1 block text-sm font-medium text-slate-700">Practice address</span>
                                            <input name="practiceAddress" value={formData.practiceAddress} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 focus-visible:ring-2 focus-visible:ring-teal-500" />
                                        </label>
                                    </div>
                                ) : (
                                    <p className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                                        Patients are shown your clinic's address and contact details. Update those under{" "}
                                        <Link to="/doctor/clinic" className="font-semibold text-teal-700 underline">Clinic</Link>.
                                    </p>
                                )}
                                <label className="block">
                                    <span className="mb-1 block text-sm font-medium text-slate-700">Education</span>
                                    <textarea name="educationText" value={formData.educationText} onChange={handleChange} rows={4} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" placeholder="One item per line" />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-sm font-medium text-slate-700">Biography highlights</span>
                                    <textarea name="biographyText" value={formData.biographyText} onChange={handleChange} rows={4} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" placeholder="One item per line" />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-sm font-medium text-slate-700">Specializations</span>
                                    <textarea name="specializationsText" value={formData.specializationsText} onChange={handleChange} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" placeholder="One item per line" />
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    <button type="submit" disabled={isLoading} className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-70">
                                        {isLoading ? "Saving..." : "Save details"}
                                    </button>
                                    <button type="button" onClick={handleCancel} className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <ListBlock title="Specialty" items={formData.specialty ? [formData.specialty] : []} icon={<Stethoscope className="h-4 w-4 text-teal-700" />} />
                                    <ListBlock title="Qualification" items={formData.qualification ? [formData.qualification] : []} icon={<Award className="h-4 w-4 text-teal-700" />} />
                                    <ListBlock
                                        title="Council registration"
                                        items={[formData.councilRegistrationNumber, formData.councilName].filter(Boolean)}
                                        icon={<BadgeCheck className="h-4 w-4 text-teal-700" />}
                                    />
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-900">Practice contact</p>
                                    <p className="mt-3 text-sm text-slate-600">{formData.contactEmail || "Not provided"}</p>
                                    <p className="mt-1 text-sm text-slate-600">{formData.practiceAddress || "Not provided"}</p>
                                </div>
                                <ListBlock title="Education" items={professionalPreview.education} icon={<GraduationCap className="h-4 w-4 text-teal-700" />} />
                                <ListBlock title="Biography" items={professionalPreview.biography} icon={<BookOpen className="h-4 w-4 text-teal-700" />} />
                                <ListBlock title="Specializations" items={professionalPreview.specializations} icon={<Stethoscope className="h-4 w-4 text-teal-700" />} />
                            </>
                        )}
                    </div>
                </form>
            </section>
        </div>
    );
};

export default ProfessionalDetails;
