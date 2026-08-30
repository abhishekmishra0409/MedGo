// Symptom → specialty routing.
//
// A static table, not a database collection: the list is small, versioning it in
// git makes clinical review a pull request, and it needs no infrastructure. All
// matching is local, so step 1 of the booking flow costs no round trip.
//
// `redFlag` entries interrupt the flow with emergency guidance instead of
// offering a booking. Every red-flag entry MUST carry `advice` — the test
// enforces this, because a red flag with no instruction is worse than none.
//
// `specialty` values must exist in ./specialties.js (also enforced by the test):
// a typo here would silently route a patient to zero doctors.

import { SPECIALTY_NAMES } from "./specialties.js";

export const BODY_AREAS = [
    { id: "general", label: "General & fever" },
    { id: "head", label: "Head & neck" },
    { id: "chest", label: "Chest & breathing" },
    { id: "abdomen", label: "Stomach & digestion" },
    { id: "skin", label: "Skin, hair & nails" },
    { id: "bones", label: "Bones, joints & muscles" },
    { id: "mental", label: "Mental health" },
    { id: "womens", label: "Women's health" },
    { id: "child", label: "Child health" },
    { id: "urinary", label: "Kidney & urinary" },
    { id: "eyes", label: "Eyes" },
    { id: "dental", label: "Teeth & gums" },
];

const EMERGENCY = "Call 108 now or go to the nearest emergency department. Do not wait for an appointment.";

export const SYMPTOMS = [
    // --- Red flags -------------------------------------------------------
    { id: "chest-pain", label: "Chest pain or pressure", area: "chest", specialty: "Cardiology", redFlag: true, advice: EMERGENCY, aliases: ["heart attack", "chest tightness", "chest heaviness", "angina", "pain in chest"] },
    { id: "breathing-difficulty", label: "Severe difficulty breathing", area: "chest", specialty: "Pulmonology", redFlag: true, advice: EMERGENCY, aliases: ["can't breathe", "cannot breathe", "gasping", "breathless", "shortness of breath severe"] },
    { id: "stroke-signs", label: "Face drooping, arm weakness or slurred speech", area: "head", specialty: "Neurology", redFlag: true, advice: EMERGENCY, aliases: ["stroke", "paralysis", "slurred speech", "face droop", "sudden weakness one side"] },
    { id: "heavy-bleeding", label: "Heavy or uncontrolled bleeding", area: "general", specialty: "General Medicine", redFlag: true, advice: EMERGENCY, aliases: ["bleeding heavily", "won't stop bleeding", "haemorrhage", "hemorrhage"] },
    { id: "head-injury", label: "Severe head injury or loss of consciousness", area: "head", specialty: "Neurology", redFlag: true, advice: EMERGENCY, aliases: ["knocked out", "unconscious", "passed out after hit", "concussion severe"] },
    { id: "suicidal-thoughts", label: "Thoughts of harming yourself", area: "mental", specialty: "Psychiatry", redFlag: true, advice: "Please call 108, or the Tele-MANAS helpline on 14416, right now. You do not have to wait for an appointment to get help.", aliases: ["suicidal", "self harm", "want to die", "end my life"] },
    { id: "anaphylaxis", label: "Sudden swelling of face or throat", area: "general", specialty: "General Medicine", redFlag: true, advice: EMERGENCY, aliases: ["anaphylaxis", "throat closing", "severe allergic reaction", "face swelling sudden"] },
    { id: "severe-abdominal-pain", label: "Sudden severe abdominal pain", area: "abdomen", specialty: "Gastroenterology", redFlag: true, advice: EMERGENCY, aliases: ["stomach pain severe", "acute abdomen", "unbearable stomach pain"] },
    { id: "seizure", label: "Seizure or fit", area: "head", specialty: "Neurology", redFlag: true, advice: EMERGENCY, aliases: ["fits", "convulsion", "epilepsy attack"] },
    { id: "pregnancy-bleeding", label: "Bleeding or severe pain during pregnancy", area: "womens", specialty: "Gynecology", redFlag: true, advice: EMERGENCY, aliases: ["pregnancy bleeding", "bleeding while pregnant", "pregnancy pain severe"] },

    // --- General ---------------------------------------------------------
    { id: "fever", label: "Fever", area: "general", specialty: "General Medicine", aliases: ["temperature", "high fever", "bukhar", "chills"] },
    { id: "fatigue", label: "Tiredness or low energy", area: "general", specialty: "General Medicine", aliases: ["fatigue", "weakness", "always tired", "exhausted"] },
    { id: "weight-loss", label: "Unexplained weight loss", area: "general", specialty: "General Medicine", aliases: ["losing weight", "weight dropping"] },
    { id: "weight-gain", label: "Unexplained weight gain", area: "general", specialty: "Endocrinology", aliases: ["gaining weight", "putting on weight"] },
    { id: "body-ache", label: "Body ache", area: "general", specialty: "General Medicine", aliases: ["aching all over", "body pain"] },
    { id: "allergy", label: "Allergies or sneezing", area: "general", specialty: "General Medicine", aliases: ["allergic", "hay fever", "sneezing", "dust allergy"] },
    { id: "anemia", label: "Anemia or low haemoglobin", area: "general", specialty: "General Medicine", aliases: ["anaemia", "low hb", "low haemoglobin", "low iron"] },
    { id: "diabetes", label: "Diabetes or high blood sugar", area: "general", specialty: "Endocrinology", aliases: ["sugar", "blood sugar", "diabetic", "high sugar"] },
    { id: "thyroid", label: "Thyroid problems", area: "general", specialty: "Endocrinology", aliases: ["hypothyroid", "hyperthyroid", "tsh"] },
    { id: "high-bp", label: "High blood pressure", area: "chest", specialty: "Cardiology", aliases: ["hypertension", "bp high", "blood pressure"] },
    { id: "cholesterol", label: "High cholesterol", area: "chest", specialty: "Cardiology", aliases: ["lipid", "triglycerides"] },
    { id: "vaccination", label: "Vaccination or immunisation", area: "general", specialty: "General Medicine", aliases: ["vaccine", "immunisation", "immunization", "shot"] },
    { id: "health-checkup", label: "General health check-up", area: "general", specialty: "General Medicine", aliases: ["checkup", "check up", "full body checkup", "routine check"] },

    // --- Head & neck -----------------------------------------------------
    { id: "headache", label: "Headache", area: "head", specialty: "General Medicine", aliases: ["head pain", "sir dard"] },
    { id: "migraine", label: "Migraine", area: "head", specialty: "Neurology", aliases: ["severe headache recurring", "half head pain"] },
    { id: "dizziness", label: "Dizziness or vertigo", area: "head", specialty: "Neurology", aliases: ["vertigo", "spinning", "light headed", "giddiness"] },
    { id: "memory-problems", label: "Memory problems or confusion", area: "head", specialty: "Neurology", aliases: ["forgetting", "memory loss", "dementia"] },
    { id: "numbness", label: "Numbness or tingling", area: "head", specialty: "Neurology", aliases: ["pins and needles", "tingling", "numb"] },
    { id: "sore-throat", label: "Sore throat", area: "head", specialty: "ENT", aliases: ["throat pain", "throat infection", "gala kharab"] },
    { id: "ear-pain", label: "Ear pain or discharge", area: "head", specialty: "ENT", aliases: ["earache", "ear infection", "ear blocked"] },
    { id: "hearing-loss", label: "Hearing loss", area: "head", specialty: "ENT", aliases: ["can't hear", "deaf", "hard of hearing"] },
    { id: "blocked-nose", label: "Blocked or runny nose", area: "head", specialty: "ENT", aliases: ["sinus", "sinusitis", "congestion", "cold"] },
    { id: "nosebleed", label: "Nosebleeds", area: "head", specialty: "ENT", aliases: ["nose bleeding", "epistaxis"] },
    { id: "neck-pain", label: "Neck pain or stiffness", area: "head", specialty: "Orthopedics", aliases: ["stiff neck", "cervical pain"] },
    { id: "snoring", label: "Snoring or sleep apnoea", area: "head", specialty: "ENT", aliases: ["snore", "sleep apnea", "stop breathing in sleep"] },

    // --- Chest & breathing ----------------------------------------------
    { id: "cough", label: "Cough", area: "chest", specialty: "Pulmonology", aliases: ["coughing", "dry cough", "wet cough", "khansi"] },
    { id: "wheezing", label: "Wheezing", area: "chest", specialty: "Pulmonology", aliases: ["whistling breath", "asthma sound"] },
    { id: "asthma", label: "Asthma", area: "chest", specialty: "Pulmonology", aliases: ["inhaler", "asthmatic"] },
    { id: "palpitations", label: "Heart racing or palpitations", area: "chest", specialty: "Cardiology", aliases: ["fast heartbeat", "irregular heartbeat", "heart pounding", "arrhythmia"] },
    { id: "breathless-exertion", label: "Breathless on exertion", area: "chest", specialty: "Cardiology", aliases: ["short of breath walking", "tired climbing stairs"] },
    { id: "swollen-ankles", label: "Swollen ankles or legs", area: "chest", specialty: "Cardiology", aliases: ["leg swelling", "oedema", "edema", "puffy feet"] },

    // --- Abdomen & digestion --------------------------------------------
    { id: "stomach-pain", label: "Stomach pain", area: "abdomen", specialty: "Gastroenterology", aliases: ["belly pain", "tummy ache", "pet dard", "abdominal pain"] },
    { id: "acidity", label: "Acidity or heartburn", area: "abdomen", specialty: "Gastroenterology", aliases: ["acid reflux", "gerd", "burning chest after food", "gas"] },
    { id: "indigestion", label: "Indigestion or bloating", area: "abdomen", specialty: "Gastroenterology", aliases: ["bloated", "gassy", "fullness"] },
    { id: "constipation", label: "Constipation", area: "abdomen", specialty: "Gastroenterology", aliases: ["can't pass stool", "hard stool"] },
    { id: "diarrhoea", label: "Diarrhoea or loose motions", area: "abdomen", specialty: "Gastroenterology", aliases: ["diarrhea", "loose motion", "loose stools"] },
    { id: "vomiting", label: "Nausea or vomiting", area: "abdomen", specialty: "Gastroenterology", aliases: ["throwing up", "feeling sick", "nausea", "ulti"] },
    { id: "blood-in-stool", label: "Blood in stool", area: "abdomen", specialty: "Gastroenterology", aliases: ["rectal bleeding", "piles bleeding", "bloody stool"] },
    { id: "piles", label: "Piles or haemorrhoids", area: "abdomen", specialty: "Gastroenterology", aliases: ["hemorrhoids", "haemorrhoids", "bawaseer"] },
    { id: "jaundice", label: "Jaundice or yellow eyes", area: "abdomen", specialty: "Gastroenterology", aliases: ["yellow skin", "yellowing", "liver problem", "peelia"] },
    { id: "liver-problem", label: "Liver problems", area: "abdomen", specialty: "Gastroenterology", aliases: ["fatty liver", "hepatitis", "liver enzymes"] },

    // --- Skin ------------------------------------------------------------
    { id: "rash", label: "Skin rash", area: "skin", specialty: "Dermatology", aliases: ["rashes", "red patches", "skin irritation", "itchy skin"] },
    { id: "acne", label: "Acne or pimples", area: "skin", specialty: "Dermatology", aliases: ["pimple", "zits", "breakout"] },
    { id: "hair-loss", label: "Hair loss", area: "skin", specialty: "Dermatology", aliases: ["balding", "hair fall", "alopecia", "thinning hair"] },
    { id: "eczema", label: "Eczema or dry itchy skin", area: "skin", specialty: "Dermatology", aliases: ["dermatitis", "dry skin", "flaky skin"] },
    { id: "psoriasis", label: "Psoriasis", area: "skin", specialty: "Dermatology", aliases: ["scaly patches"] },
    { id: "fungal-infection", label: "Fungal infection or ringworm", area: "skin", specialty: "Dermatology", aliases: ["ringworm", "athlete's foot", "fungus", "daad"] },
    { id: "nail-problem", label: "Nail problems", area: "skin", specialty: "Dermatology", aliases: ["nail infection", "discoloured nails", "brittle nails"] },
    { id: "mole-change", label: "Changing mole or skin growth", area: "skin", specialty: "Dermatology", aliases: ["mole", "new lump on skin", "skin growth"] },
    { id: "pigmentation", label: "Pigmentation or dark spots", area: "skin", specialty: "Dermatology", aliases: ["dark spots", "melasma", "uneven skin tone"] },

    // --- Bones, joints & muscles ----------------------------------------
    { id: "back-pain", label: "Back pain", area: "bones", specialty: "Orthopedics", aliases: ["lower back pain", "spine pain", "kamar dard"] },
    { id: "joint-pain", label: "Joint pain", area: "bones", specialty: "Orthopedics", aliases: ["knee pain", "shoulder pain", "hip pain", "joints hurt"] },
    { id: "arthritis", label: "Arthritis", area: "bones", specialty: "Orthopedics", aliases: ["rheumatoid", "osteoarthritis", "joint swelling"] },
    { id: "fracture", label: "Suspected fracture or injury", area: "bones", specialty: "Orthopedics", aliases: ["broken bone", "sprain", "twisted ankle", "fell down"] },
    { id: "muscle-pain", label: "Muscle pain or cramps", area: "bones", specialty: "Orthopedics", aliases: ["cramp", "muscle ache", "pulled muscle"] },
    { id: "osteoporosis", label: "Weak bones or osteoporosis", area: "bones", specialty: "Orthopedics", aliases: ["bone density", "brittle bones"] },
    { id: "sciatica", label: "Shooting leg pain or sciatica", area: "bones", specialty: "Orthopedics", aliases: ["sciatic", "nerve pain leg"] },

    // --- Mental health ---------------------------------------------------
    { id: "anxiety", label: "Anxiety or constant worry", area: "mental", specialty: "Psychiatry", aliases: ["panic", "panic attacks", "worried all the time", "nervous"] },
    { id: "depression", label: "Low mood or depression", area: "mental", specialty: "Psychiatry", aliases: ["sad all the time", "depressed", "no interest", "hopeless"] },
    { id: "insomnia", label: "Trouble sleeping", area: "mental", specialty: "Psychiatry", aliases: ["insomnia", "can't sleep", "cannot sleep", "sleepless", "not sleeping"] },
    { id: "stress", label: "Stress or burnout", area: "mental", specialty: "Psychiatry", aliases: ["burnout", "overwhelmed", "too much stress"] },
    { id: "addiction", label: "Alcohol or substance concerns", area: "mental", specialty: "Psychiatry", aliases: ["alcohol", "drinking problem", "smoking", "addiction", "de-addiction"] },

    // --- Women's health --------------------------------------------------
    { id: "irregular-periods", label: "Irregular or missed periods", area: "womens", specialty: "Gynecology", aliases: ["periods late", "missed period", "menstrual irregular"] },
    { id: "period-pain", label: "Painful periods", area: "womens", specialty: "Gynecology", aliases: ["cramps periods", "dysmenorrhea", "menstrual pain"] },
    { id: "pregnancy-care", label: "Pregnancy care", area: "womens", specialty: "Gynecology", aliases: ["pregnant", "antenatal", "prenatal", "expecting"] },
    { id: "pcos", label: "PCOS or PCOD", area: "womens", specialty: "Gynecology", aliases: ["polycystic", "pcod"] },
    { id: "fertility", label: "Difficulty conceiving", area: "womens", specialty: "Gynecology", aliases: ["infertility", "trying to conceive", "can't get pregnant"] },
    { id: "menopause", label: "Menopause symptoms", area: "womens", specialty: "Gynecology", aliases: ["hot flashes", "menopausal"] },
    { id: "breast-lump", label: "Breast lump or pain", area: "womens", specialty: "Gynecology", aliases: ["lump in breast", "breast pain"] },

    // --- Child health ----------------------------------------------------
    { id: "child-fever", label: "Fever in a child", area: "child", specialty: "Pediatrics", aliases: ["baby fever", "kid fever", "child temperature"] },
    { id: "child-cough", label: "Cough or cold in a child", area: "child", specialty: "Pediatrics", aliases: ["baby cough", "child cold"] },
    { id: "child-growth", label: "Growth or development concerns", area: "child", specialty: "Pediatrics", aliases: ["not growing", "delayed milestones", "development delay"] },
    { id: "child-feeding", label: "Feeding or nutrition concerns", area: "child", specialty: "Pediatrics", aliases: ["not eating", "baby feeding", "child nutrition"] },
    { id: "child-vaccination", label: "Child vaccination", area: "child", specialty: "Pediatrics", aliases: ["baby vaccine", "child immunisation"] },

    // --- Kidney & urinary ------------------------------------------------
    { id: "burning-urination", label: "Burning or pain when urinating", area: "urinary", specialty: "Urology", aliases: ["uti", "urine infection", "burning urine"] },
    { id: "frequent-urination", label: "Passing urine too often", area: "urinary", specialty: "Urology", aliases: ["urinating frequently", "peeing a lot"] },
    { id: "kidney-stone", label: "Kidney stones", area: "urinary", specialty: "Urology", aliases: ["stone in kidney", "renal stone"] },
    { id: "blood-in-urine", label: "Blood in urine", area: "urinary", specialty: "Urology", aliases: ["red urine", "haematuria"] },
    { id: "prostate", label: "Prostate concerns", area: "urinary", specialty: "Urology", aliases: ["prostate enlarged", "psa"] },

    // --- Eyes -------------------------------------------------------------
    { id: "blurred-vision", label: "Blurred vision", area: "eyes", specialty: "Ophthalmology", aliases: ["can't see clearly", "vision blurry", "eyesight problem"] },
    { id: "eye-pain", label: "Eye pain or redness", area: "eyes", specialty: "Ophthalmology", aliases: ["red eye", "sore eye", "eye infection"] },
    { id: "dry-eyes", label: "Dry or watering eyes", area: "eyes", specialty: "Ophthalmology", aliases: ["watery eyes", "itchy eyes"] },
    { id: "cataract", label: "Cataract", area: "eyes", specialty: "Ophthalmology", aliases: ["cloudy vision", "motiyabind"] },

    // --- Dental -----------------------------------------------------------
    { id: "toothache", label: "Toothache", area: "dental", specialty: "Dentistry", aliases: ["tooth pain", "dant dard", "cavity pain"] },
    { id: "bleeding-gums", label: "Bleeding or swollen gums", area: "dental", specialty: "Dentistry", aliases: ["gum bleeding", "gingivitis", "swollen gums"] },
    { id: "dental-checkup", label: "Dental check-up or cleaning", area: "dental", specialty: "Dentistry", aliases: ["scaling", "teeth cleaning", "dental checkup"] },
];

/**
 * Rank symptoms against a free-text query.
 *
 * Deliberately a single entry point: an assisted suggestion layer could be
 * added behind this signature later without touching the UI.
 */
export const matchSymptom = (query, limit = 8) => {
    const term = String(query || "").trim().toLowerCase();
    if (!term) return [];

    const termWords = term.split(/\s+/).filter((word) => word.length > 2);

    const scored = SYMPTOMS.map((symptom) => {
        const label = symptom.label.toLowerCase();
        const aliases = (symptom.aliases || []).map((alias) => alias.toLowerCase());
        const haystack = `${label} ${aliases.join(" ")}`;

        let score = 0;
        if (label === term || aliases.includes(term)) score = 100;
        else if (label.startsWith(term)) score = 80;
        else if (aliases.some((alias) => alias.startsWith(term))) score = 70;
        else if (label.includes(term)) score = 50;
        else if (
            // Patients type phrases whose words aren't adjacent in our label —
            // "irregular periods" against "Irregular or missed periods".
            // Substring matching alone misses every one of those.
            termWords.length > 1
            && termWords.every((word) => haystack.includes(word))
        ) score = 45;
        else if (aliases.some((alias) => alias.includes(term))) score = 40;
        else if (term.length >= 4 && aliases.some((alias) => term.includes(alias))) score = 30;

        return { symptom, score };
    }).filter((entry) => entry.score > 0);

    // Red flags first at equal relevance — never bury an emergency under a
    // better-matching routine complaint.
    scored.sort((a, b) => (
        b.score - a.score
        || Number(b.symptom.redFlag || false) - Number(a.symptom.redFlag || false)
        || a.symptom.label.localeCompare(b.symptom.label)
    ));

    return scored.slice(0, limit).map((entry) => entry.symptom);
};

export const symptomsByArea = (areaId) => SYMPTOMS.filter((symptom) => symptom.area === areaId);

export const getSymptom = (id) => SYMPTOMS.find((symptom) => symptom.id === id) || null;

export const hasRedFlag = (symptoms = []) => symptoms.some((symptom) => symptom.redFlag);

// Guard against a specialty typo silently routing a patient to zero doctors.
export const validateSymptomTable = () => {
    const problems = [];
    const seen = new Set();

    SYMPTOMS.forEach((symptom) => {
        if (seen.has(symptom.id)) problems.push(`duplicate id: ${symptom.id}`);
        seen.add(symptom.id);

        if (!SPECIALTY_NAMES.includes(symptom.specialty)) {
            problems.push(`${symptom.id}: unknown specialty "${symptom.specialty}"`);
        }
        if (!BODY_AREAS.some((area) => area.id === symptom.area)) {
            problems.push(`${symptom.id}: unknown area "${symptom.area}"`);
        }
        if (symptom.redFlag && !symptom.advice) {
            problems.push(`${symptom.id}: red flag with no advice`);
        }
    });

    return problems;
};
