const fs = require('fs');
const path = require('path');

const defaultInputPath = 'C:\\Users\\HP\\Downloads\\MedGo.doctors.json';
const outputDir = path.join(__dirname, '..', 'data');
const outputJsonPath = path.join(outputDir, 'doctor-users-import.json');
const outputCsvPath = path.join(outputDir, 'doctor-users-import.csv');

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const unwrapOid = (value) => value?.$oid || '';
const unwrapDate = (value) => value?.$date || '';

const toCsvValue = (value) => {
    if (value === null || value === undefined) {
        return '';
    }

    const stringValue =
        typeof value === 'string'
            ? value
            : typeof value === 'number' || typeof value === 'boolean'
                ? String(value)
                : JSON.stringify(value);

    return `"${stringValue.replace(/"/g, '""')}"`;
};

const mapDoctorToUnifiedUser = (doctor) => ({
    legacyDoctorId: unwrapOid(doctor._id),
    username: doctor.name || '',
    name: doctor.name || '',
    email: doctor.email || doctor.contact?.email || '',
    phone: doctor.contact?.phone || '',
    password: doctor.password || '',
    role: 'doctor',
    avatar: doctor.image || '',
    'doctorProfile.specialty': doctor.specialty || '',
    'doctorProfile.qualification': doctor.qualification || '',
    'doctorProfile.image': doctor.image || '',
    'doctorProfile.cloudinary_id': doctor.cloudinary_id || '',
    'doctorProfile.contactEmail': doctor.contact?.email || doctor.email || '',
    'doctorProfile.address': doctor.contact?.address || '',
    'doctorProfile.workingHours': (doctor.workingHours || []).map((slot) => ({
        days: slot.days || '',
        hours: slot.hours || '',
    })),
    'doctorProfile.education': doctor.education || [],
    'doctorProfile.biography': doctor.biography || [],
    'doctorProfile.specializations': doctor.specializations || [],
    'doctorProfile.rating': doctor.rating ?? 0,
    'doctorProfile.reviews': doctor.reviews ?? 0,
    createdAt: unwrapDate(doctor.createdAt),
    updatedAt: unwrapDate(doctor.updatedAt),
});

const convert = (inputPath) => {
    const doctors = readJson(inputPath);
    const rows = doctors.map(mapDoctorToUnifiedUser);
    const headers = Object.keys(rows[0] || {});

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputJsonPath, JSON.stringify(rows, null, 2));

    const csvLines = [
        headers.join(','),
        ...rows.map((row) => headers.map((header) => toCsvValue(row[header])).join(',')),
    ];

    fs.writeFileSync(outputCsvPath, `${csvLines.join('\n')}\n`);

    console.log(`Converted ${rows.length} doctors`);
    console.log(`JSON: ${outputJsonPath}`);
    console.log(`CSV: ${outputCsvPath}`);
};

convert(process.argv[2] || defaultInputPath);
