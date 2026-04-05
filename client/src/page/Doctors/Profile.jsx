import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDoctorProfile, updateDoctorProfile } from "../../features/Doctor/DoctorSlice.js";

const toWorkingHoursText = (workingHours = []) =>
    (workingHours || [])
        .map((slot) => `${slot.days || ""} | ${slot.hours || ""}`.trim())
        .filter(Boolean)
        .join("\n");

const parseWorkingHoursText = (value = "") =>
    value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [days, hours] = line.split("|").map((item) => item?.trim() || "");
            return { days, hours };
        })
        .filter((slot) => slot.days || slot.hours);

const toMultilineText = (items = []) => (items || []).filter(Boolean).join("\n");
const parseMultilineText = (value = "") =>
    value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

const formatDate = (value) => {
    if (!value) {
        return "-";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return "-";
    }

    return parsed.toLocaleDateString();
};

const buildFormFromProfile = (profile = {}) => ({
    name: profile.name || profile.username || "",
    email: profile.email || "",
    phone: profile.phone || profile.contact?.phone || "",
    specialty: profile.specialty || "",
    qualification: profile.qualification || "",
    address: profile.contact?.address || "",
    contactEmail: profile.contact?.email || profile.email || "",
    image: profile.image || profile.avatar || "",
    workingHoursText: toWorkingHoursText(profile.workingHours),
    biographyText: toMultilineText(profile.biography),
    educationText: toMultilineText(profile.education),
    specializationsText: toMultilineText(profile.specializations),
});

const DoctorsProfile = () => {
    const dispatch = useDispatch();
    const { profile, isLoading } = useSelector((state) => state.doctor);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(buildFormFromProfile(profile));

    useEffect(() => {
        dispatch(getDoctorProfile());
    }, [dispatch]);

    useEffect(() => {
        setFormData(buildFormFromProfile(profile));
    }, [profile]);

    const workingHours = useMemo(() => parseWorkingHoursText(formData.workingHoursText), [formData.workingHoursText]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleCancelEdit = () => {
        setFormData(buildFormFromProfile(profile));
        setIsEditing(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const payload = {
            name: formData.name,
            username: formData.name,
            email: formData.email,
            phone: formData.phone,
            avatar: formData.image,
            doctorProfile: {
                specialty: formData.specialty,
                qualification: formData.qualification,
                image: formData.image,
                contactEmail: formData.contactEmail,
                address: formData.address,
                workingHours: parseWorkingHoursText(formData.workingHoursText),
                biography: parseMultilineText(formData.biographyText),
                education: parseMultilineText(formData.educationText),
                specializations: parseMultilineText(formData.specializationsText),
            },
        };

        const result = await dispatch(updateDoctorProfile(payload));
        if (updateDoctorProfile.fulfilled.match(result)) {
            setIsEditing(false);
        }
    };

    if (isLoading && !profile) {
        return <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6">Loading profile...</div>;
    }

    return (
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Doctor profile</p>
                    <h1 className="mt-2 text-3xl font-semibold text-slate-950">{profile?.name || "Doctor"}</h1>
                    <p className="mt-1 text-sm text-slate-500">Update your working hours, qualifications, and contact details.</p>
                </div>

                {!isEditing ? (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                        Edit profile
                    </button>
                ) : null}
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[320px_1fr]">
                <section className="space-y-4 rounded-2xl bg-slate-50 p-4">
                    <img
                        src={formData.image || "/doctor.png"}
                        alt={formData.name || "Doctor"}
                        className="h-56 w-full rounded-2xl object-cover"
                    />

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-slate-700">Image URL</label>
                        <input
                            name="image"
                            value={formData.image}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                        />
                    </div>

                    <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">Rating</p>
                        <p className="mt-1">{profile?.rating ?? 0} ({profile?.reviews ?? 0} reviews)</p>
                    </div>

                    <div className="rounded-2xl bg-white p-4 text-sm text-slate-700">
                        <p className="font-semibold text-slate-900">Additional Information</p>
                        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <p className="text-slate-500">Member Since</p>
                                <p className="mt-1 text-sm text-slate-900">{formatDate(profile?.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-slate-500">Last Updated</p>
                                <p className="mt-1 text-sm text-slate-900">{formatDate(profile?.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
                            <input
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Contact email</label>
                            <input
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Specialty</label>
                            <input
                                name="specialty"
                                value={formData.specialty}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Qualification</label>
                            <input
                                name="qualification"
                                value={formData.qualification}
                                onChange={handleChange}
                                disabled={!isEditing}
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Address</label>
                        <input
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            disabled={!isEditing}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Working hours</label>
                        <textarea
                            name="workingHoursText"
                            value={formData.workingHoursText}
                            onChange={handleChange}
                            disabled={!isEditing}
                            rows={4}
                            placeholder="Example: Monday - Friday | 09:00 - 17:00"
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                        />
                        {!isEditing && workingHours.length ? (
                            <div className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                                {workingHours.map((slot, index) => (
                                    <p key={`${slot.days}-${index}`}>{slot.days}: {slot.hours}</p>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Biography (one line per point)</label>
                        <textarea
                            name="biographyText"
                            value={formData.biographyText}
                            onChange={handleChange}
                            disabled={!isEditing}
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Education (one line per point)</label>
                        <textarea
                            name="educationText"
                            value={formData.educationText}
                            onChange={handleChange}
                            disabled={!isEditing}
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">Specializations (one line per item)</label>
                        <textarea
                            name="specializationsText"
                            value={formData.specializationsText}
                            onChange={handleChange}
                            disabled={!isEditing}
                            rows={3}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
                        />
                    </div>

                    {isEditing ? (
                        <div className="flex flex-wrap gap-3">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-70"
                            >
                                {isLoading ? "Saving..." : "Save profile"}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : null}
                </section>
            </form>
        </div>
    );
};

export default DoctorsProfile;
