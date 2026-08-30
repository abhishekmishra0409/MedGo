// The canonical specialty list.
//
// `doctorProfile.specialty` is a free-text String with no enum, and real records
// disagree with the taxonomy: the UI says "Cardiology", doctors are stored as
// "Cardiologist". The specialty filter is exact equality, so those never match.
// `aliases` is what bridges that without a data migration — resolveSpecialty()
// runs on write (so new records are canonical) and on query (so old ones still
// resolve).
//
// Keep this file in step with server/Utils/specialties.js.

export const SPECIALTIES = [
    {
        name: "Cardiology",
        gloss: "Heart Care",
        icon: "/Cardiology_icon.svg",
        aliases: ["cardiologist", "cardiac", "heart", "heart specialist", "cardiovascular"],
    },
    {
        name: "Neurology",
        gloss: "Brain & Nerves",
        icon: "/Neurology_icon.svg",
        aliases: ["neurologist", "neurosurgeon", "neuro", "brain", "nerve specialist", "neurosurgery"],
    },
    {
        name: "Orthopedics",
        gloss: "Bones & Joints",
        icon: "/Orthopedics_icon.svg",
        aliases: ["orthopedic", "orthopaedics", "orthopaedic", "orthopedist", "bone specialist", "joint"],
    },
    {
        name: "Pediatrics",
        gloss: "Child Care",
        icon: "/Pediatrics_icon.svg",
        aliases: ["pediatrician", "paediatrics", "paediatrician", "child specialist", "children"],
    },
    {
        name: "Dermatology",
        gloss: "Skin Care",
        icon: "/Dermatology_icon.svg",
        aliases: ["dermatologist", "skin", "skin specialist"],
    },
    {
        name: "Oncology",
        gloss: "Cancer Care",
        icon: "/oncology_icon.svg",
        aliases: ["oncologist", "cancer", "cancer specialist", "tumour", "tumor"],
    },
    {
        name: "Gynecology",
        gloss: "Women's Health",
        icon: "/Gynecology_icon.svg",
        aliases: ["gynecologist", "gynaecology", "gynaecologist", "obstetrics", "obgyn", "ob-gyn", "women's health"],
    },
    {
        name: "Urology",
        gloss: "Kidney & Urinary",
        icon: "/Urology_icon.svg",
        aliases: ["urologist", "kidney", "urinary", "nephrology", "nephrologist"],
    },
    {
        name: "Radiology",
        gloss: "Imaging & Scans",
        icon: "/Radiology_icon.svg",
        aliases: ["radiologist", "imaging", "scan", "x-ray", "mri"],
    },
    {
        name: "General Medicine",
        gloss: "General Health",
        icon: "/Cardiology_icon.svg",
        aliases: [
            "general physician", "physician", "gp", "general practitioner",
            "internal medicine", "family medicine", "general",
        ],
    },
    {
        name: "Gastroenterology",
        gloss: "Digestive Health",
        icon: "/oncology_icon.svg",
        aliases: ["gastroenterologist", "gastro", "digestive", "stomach", "liver", "hepatology"],
    },
    {
        name: "Pulmonology",
        gloss: "Lungs & Breathing",
        icon: "/Radiology_icon.svg",
        aliases: ["pulmonologist", "chest specialist", "respiratory", "lung", "lungs"],
    },
    {
        name: "Endocrinology",
        gloss: "Hormones & Diabetes",
        icon: "/Cardiology_icon.svg",
        aliases: ["endocrinologist", "diabetes", "diabetologist", "thyroid", "hormone"],
    },
    {
        name: "Psychiatry",
        gloss: "Mental Health",
        icon: "/Neurology_icon.svg",
        aliases: ["psychiatrist", "mental health", "psychologist", "counsellor", "counselor", "therapist"],
    },
    {
        name: "ENT",
        gloss: "Ear, Nose & Throat",
        icon: "/Neurology_icon.svg",
        aliases: ["otolaryngology", "otolaryngologist", "ear nose throat", "ear", "nose", "throat"],
    },
    {
        name: "Ophthalmology",
        gloss: "Eye Care",
        icon: "/Radiology_icon.svg",
        aliases: ["ophthalmologist", "eye", "eye specialist", "optometry", "optometrist", "vision"],
    },
    {
        name: "Dentistry",
        gloss: "Dental Care",
        icon: "/Pediatrics_icon.svg",
        aliases: ["dentist", "dental", "teeth", "tooth", "oral"],
    },
];

export const SPECIALTY_NAMES = SPECIALTIES.map((item) => item.name);

const BY_KEY = new Map();
SPECIALTIES.forEach((specialty) => {
    BY_KEY.set(specialty.name.toLowerCase(), specialty.name);
    specialty.aliases.forEach((alias) => BY_KEY.set(alias.toLowerCase(), specialty.name));
});

/**
 * Map any stored or typed specialty onto its canonical name.
 * Returns the trimmed input unchanged when nothing matches, so an unusual
 * specialty is preserved rather than silently dropped.
 */
export const resolveSpecialty = (value) => {
    const key = String(value || "").trim().toLowerCase();
    if (!key) return "";
    return BY_KEY.get(key) || String(value).trim();
};

export const getSpecialty = (name) =>
    SPECIALTIES.find((item) => item.name === resolveSpecialty(name)) || null;
