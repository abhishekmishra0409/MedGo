export const Doctors = [
    {
        id: 1,
        name: "Dr. Sarah Taylor",
        specialty: "Neurosurgeon",
        qualification: "MBBS in Neurology, PhD in Neurosurgery",
        image: "./doctor1.png",
        contact: {
            phone: "+07 554 332 322",
            email: "sarah.taylor@medsev.com",
            address: "4th Floor, 408 No Chamber",
        },
        workingHours: [
            { days: "Monday - Friday", hours: "8:00 - 20:00" },
            { days: "Saturday", hours: "9:00 - 18:00" },
            { days: "Monday - Thursday", hours: "9:00 - 15:00" },
        ],
        education: [
            "PhD in Neurology at University of Mediserv (2006)",
            "Master of Neuro Surgery at University of Mediserv (2002)",
            "MBBS in Neurosciences at University of Mediserv (2002)",
            "Higher Secondary Certificate at Mediserv College (1991)",
        ],
        biography: [
            "Dr. Sarah Taylor is a highly experienced neurosurgeon specializing in complex brain surgeries and neurological disorders.",
            "She has over 15 years of expertise in treating patients with precision and care, making her a trusted professional in the medical field.",
            "Her research and innovations in neuroscience have significantly contributed to the medical community worldwide.",
        ],
        specializations: [
            "Brain Surgery",
            "Spinal Surgery",
            "Neurological Disorders",
            "Pediatric Neurosurgery",
            "Neurotrauma"
        ],
        rating: 4.9,
        reviews: 128
    },
    {
        id: 2,
        name: "Dr. Michael Chen",
        specialty: "Cardiologist",
        qualification: "MD in Cardiology, FACC",
        image: "./doctor2.png",
        contact: {
            phone: "+07 555 123 456",
            email: "michael.chen@medsev.com",
            address: "3rd Floor, 307 Heart Center",
        },
        workingHours: [
            { days: "Monday - Wednesday", hours: "9:00 - 17:00" },
            { days: "Thursday - Friday", hours: "10:00 - 19:00" },
            { days: "Saturday", hours: "9:00 - 14:00" },
        ],
        education: [
            "Fellowship in Cardiology at National Heart Institute (2010)",
            "MD in Internal Medicine at Metro Medical College (2006)",
            "MBBS at City University Hospital (2002)",
        ],
        biography: [
            "Dr. Michael Chen is a board-certified cardiologist with extensive experience in interventional cardiology.",
            "He specializes in minimally invasive procedures and has performed over 2,000 successful angioplasties.",
            "Dr. Chen is known for his patient-centered approach and commitment to cardiovascular health education.",
        ],
        specializations: [
            "Interventional Cardiology",
            "Heart Failure Management",
            "Cardiac Rehabilitation",
            "Preventive Cardiology",
            "Arrhythmia Treatment"
        ],
        rating: 4.8,
        reviews: 97
    },
    {
        id: 3,
        name: "Dr. Priya Sharma",
        specialty: "Pediatrician",
        qualification: "MD in Pediatrics, DCH",
        image: "./doctor3.png",
        contact: {
            phone: "+07 556 789 012",
            email: "priya.sharma@medsev.com",
            address: "2nd Floor, 209 Children's Wing",
        },
        workingHours: [
            { days: "Monday - Friday", hours: "10:00 - 18:00" },
            { days: "Saturday", hours: "9:00 - 15:00" },
        ],
        education: [
            "Diploma in Child Health (DCH) at Children's Medical Institute (2012)",
            "MD in Pediatrics at University Hospital (2009)",
            "MBBS at State Medical College (2005)",
        ],
        biography: [
            "Dr. Priya Sharma is a compassionate pediatrician with over 12 years of experience in child healthcare.",
            "She specializes in neonatal care and childhood developmental disorders.",
            "Dr. Sharma is actively involved in community health programs for underprivileged children.",
        ],
        specializations: [
            "Neonatal Care",
            "Childhood Immunization",
            "Developmental Disorders",
            "Adolescent Medicine",
            "Pediatric Nutrition"
        ],
        rating: 4.7,
        reviews: 143
    }
];