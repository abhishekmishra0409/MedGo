import { useEffect, useRef, useState } from "react";
import { CalendarDays, HeartPulse, Mail, MapPin, Phone, Shield, UploadCloud, UserRound, X } from "lucide-react";
import { toast } from "react-toastify";

const emptyAddress = {
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
};

const emptyEmergencyContact = {
    name: "",
    relationship: "",
    phone: "",
};

const formatDateForInput = (value) => {
    if (!value) {
        return "";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return "";
    }

    return parsed.toISOString().slice(0, 10);
};

const formatDisplayDate = (value) => {
    const inputDate = formatDateForInput(value);
    if (!inputDate) {
        return "Not provided";
    }

    return new Date(inputDate).toLocaleDateString();
};

const normalizeProfile = (profile = {}) => ({
    name: profile.name || profile.username || "",
    username: profile.username || profile.name || "",
    email: profile.email || "",
    phone: profile.phone || profile.contact?.phone || "",
    avatar: profile.avatar || profile.image || "",
    bio: profile.bio || "",
    dateOfBirth: formatDateForInput(profile.dateOfBirth),
    gender: profile.gender || "",
    bloodGroup: profile.bloodGroup || "",
    address: {
        ...emptyAddress,
        ...(profile.address || {}),
    },
    emergencyContact: {
        ...emptyEmergencyContact,
        ...(profile.emergencyContact || {}),
    },
});

const valueOrFallback = (value) => value || "Not provided";

const FieldValue = ({ label, value, icon: Icon }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            {Icon ? <Icon className="h-4 w-4 text-teal-700" /> : null}
            <span>{label}</span>
        </div>
        <p className="mt-2 break-words text-base font-semibold text-slate-950">{valueOrFallback(value)}</p>
    </div>
);

const InputField = ({ label, name, value, onChange, type = "text", required = false, placeholder = "" }) => (
    <label className="block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
        />
    </label>
);

const CommonProfile = ({ profile, roleLabel = "Patient", isLoading = false, onSave, onUploadAvatar }) => {
    const initialForm = normalizeProfile(profile);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(initialForm);
    const [isAvatarUploading, setIsAvatarUploading] = useState(false);
    const [isAvatarDragActive, setIsAvatarDragActive] = useState(false);
    const avatarInputRef = useRef(null);

    useEffect(() => {
        setFormData(normalizeProfile(profile));
    }, [profile]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleNestedChange = (group, field, value) => {
        setFormData((current) => ({
            ...current,
            [group]: {
                ...current[group],
                [field]: value,
            },
        }));
    };

    const handleAvatarFile = async (file) => {
        if (!file || !onUploadAvatar) {
            return;
        }

        if (!file.type?.startsWith("image/")) {
            toast.error("Please select a valid image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be 5MB or less");
            return;
        }

        setIsAvatarUploading(true);
        try {
            const imageUrl = await onUploadAvatar(file);
            if (!imageUrl) {
                throw new Error("Image upload did not return a URL");
            }

            setFormData((current) => ({ ...current, avatar: imageUrl }));
            toast.success("Profile picture uploaded");
        } catch (error) {
            toast.error(error?.message || "Failed to upload profile picture");
        } finally {
            setIsAvatarUploading(false);
        }
    };

    const handleAvatarInputChange = async (event) => {
        await handleAvatarFile(event.target.files?.[0]);
        event.target.value = "";
    };

    const handleAvatarDrop = async (event) => {
        event.preventDefault();
        setIsAvatarDragActive(false);
        await handleAvatarFile(event.dataTransfer.files?.[0]);
    };

    const handleCancel = () => {
        setFormData(normalizeProfile(profile));
        setIsEditing(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const result = await onSave({
            name: formData.name,
            username: formData.username || formData.name,
            email: formData.email,
            phone: formData.phone,
            avatar: formData.avatar,
            bio: formData.bio,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            bloodGroup: formData.bloodGroup,
            address: formData.address,
            emergencyContact: formData.emergencyContact,
        });

        if (result !== false) {
            setIsEditing(false);
        }
    };

    return (
        <div className="w-full space-y-5">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-gradient-to-r from-teal-600 to-slate-900 px-5 py-8 text-white sm:px-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex items-center gap-4">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt={formData.name || "Profile"} className="h-20 w-20 rounded-3xl border border-white/30 object-cover" />
                            ) : (
                                <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/30 bg-white/15">
                                    <UserRound className="h-10 w-10 text-white" />
                                </div>
                            )}
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-100">{roleLabel} profile</p>
                                <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">{formData.name || "Complete your profile"}</h1>
                                <p className="mt-1 text-sm text-slate-200">{formData.bio || "Keep your account, contact, and care details updated."}</p>
                            </div>
                        </div>
                        {!isEditing ? (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-slate-100"
                            >
                                Edit profile
                            </button>
                        ) : null}
                    </div>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-900">Profile picture</p>
                            <div className="mt-4 grid gap-4 lg:grid-cols-[180px_1fr] lg:items-center">
                                <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white">
                                    {formData.avatar ? (
                                        <img src={formData.avatar} alt={formData.name || "Profile preview"} className="h-full w-full object-cover" />
                                    ) : (
                                        <UserRound className="h-14 w-14 text-teal-700" />
                                    )}
                                </div>
                                <div>
                                    <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarInputChange} />
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => !isAvatarUploading && avatarInputRef.current?.click()}
                                        onKeyDown={(event) => {
                                            if ((event.key === "Enter" || event.key === " ") && !isAvatarUploading) {
                                                event.preventDefault();
                                                avatarInputRef.current?.click();
                                            }
                                        }}
                                        onDragEnter={(event) => {
                                            event.preventDefault();
                                            setIsAvatarDragActive(true);
                                        }}
                                        onDragOver={(event) => {
                                            event.preventDefault();
                                            setIsAvatarDragActive(true);
                                        }}
                                        onDragLeave={(event) => {
                                            event.preventDefault();
                                            setIsAvatarDragActive(false);
                                        }}
                                        onDrop={handleAvatarDrop}
                                        className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition ${
                                            isAvatarDragActive ? "border-teal-400 bg-teal-50" : "border-slate-300 bg-white"
                                        }`}
                                    >
                                        <UploadCloud className="h-8 w-8 text-teal-700" />
                                        <p className="mt-2 text-sm font-semibold text-slate-800">
                                            {isAvatarUploading ? "Uploading..." : "Choose or drag profile picture"}
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-slate-500">JPG, PNG, or WEBP up to 5MB. The uploaded Cloudinary image will be saved with your profile.</p>
                                    </div>
                                    {formData.avatar ? (
                                        <button
                                            type="button"
                                            onClick={() => setFormData((current) => ({ ...current, avatar: "" }))}
                                            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                            Remove picture
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                            <InputField label="Full name" name="name" value={formData.name} onChange={handleChange} required />
                            <InputField label="Username" name="username" value={formData.username} onChange={handleChange} required />
                            <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" required />
                            <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} type="tel" required />
                            <InputField label="Date of birth" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} type="date" />
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-slate-700">Gender</span>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                            </label>
                            <label className="block">
                                <span className="mb-1 block text-sm font-semibold text-slate-700">Blood group</span>
                                <select
                                    name="bloodGroup"
                                    value={formData.bloodGroup}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                                >
                                    <option value="">Select blood group</option>
                                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                                        <option key={group} value={group}>{group}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <label className="block">
                            <span className="mb-1 block text-sm font-semibold text-slate-700">About</span>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows={3}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                                placeholder="Short profile note"
                            />
                        </label>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-900">Address</p>
                            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                                {Object.entries({
                                    line1: "Address line 1",
                                    line2: "Address line 2",
                                    city: "City",
                                    state: "State",
                                    postalCode: "Postal code",
                                    country: "Country",
                                }).map(([field, label]) => (
                                    <InputField
                                        key={field}
                                        label={label}
                                        value={formData.address[field]}
                                        onChange={(event) => handleNestedChange("address", field, event.target.value)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-sm font-semibold text-slate-900">Emergency contact</p>
                            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                                {Object.entries({
                                    name: "Contact name",
                                    relationship: "Relationship",
                                    phone: "Contact phone",
                                }).map(([field, label]) => (
                                    <InputField
                                        key={field}
                                        label={label}
                                        value={formData.emergencyContact[field]}
                                        onChange={(event) => handleNestedChange("emergencyContact", field, event.target.value)}
                                        type={field === "phone" ? "tel" : "text"}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button type="button" onClick={handleCancel} className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                Cancel
                            </button>
                            <button type="submit" disabled={isLoading} className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-70">
                                {isLoading ? "Saving..." : "Save profile"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-5 p-5 sm:p-6">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <FieldValue label="Email" value={formData.email} icon={Mail} />
                            <FieldValue label="Phone" value={formData.phone} icon={Phone} />
                            <FieldValue label="Date of birth" value={formatDisplayDate(formData.dateOfBirth)} icon={CalendarDays} />
                            <FieldValue label="Blood group" value={formData.bloodGroup} icon={HeartPulse} />
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <MapPin className="h-4 w-4 text-teal-700" />
                                    Address
                                </p>
                                <p className="mt-3 leading-7 text-slate-600">
                                    {[formData.address.line1, formData.address.line2, formData.address.city, formData.address.state, formData.address.postalCode, formData.address.country]
                                        .filter(Boolean)
                                        .join(", ") || "Not provided"}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <Shield className="h-4 w-4 text-teal-700" />
                                    Emergency contact
                                </p>
                                <div className="mt-3 space-y-1 text-slate-600">
                                    <p className="font-semibold text-slate-900">{valueOrFallback(formData.emergencyContact.name)}</p>
                                    <p>{valueOrFallback(formData.emergencyContact.relationship)}</p>
                                    <p>{valueOrFallback(formData.emergencyContact.phone)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <UserRound className="h-4 w-4 text-teal-700" />
                                About
                            </p>
                            <p className="mt-3 leading-7 text-slate-600">{valueOrFallback(formData.bio)}</p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default CommonProfile;
