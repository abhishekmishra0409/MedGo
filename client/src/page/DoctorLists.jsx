import React, { useState } from "react";
import SearchFilter from "../component/Common/SearchFilter.jsx";
import DoctorCard from "../component/Common/DoctorCard.jsx";

export const doctors = [
    {
        id: 1,
        name: "Dr. A K Jinsiwale",
        position: "Sr. Consultant",
        speciality: "Orthopaedics",
        qualification: "MBBS, MS (Ortho), Dip M.V.S (Sweden), F.S.O.S",
        hospital: "CARE CHL Hospitals, Indore",
        image: "./Doctor01.png" // Replace with actual image path
    },
    {
        id: 2,
        name: "Dr. S K Sharma",
        position: "Consultant",
        speciality: "Cardiology",
        qualification: "MBBS, MD (Cardio), FACC",
        hospital: "Apollo Hospitals, Indore",
        image: "./Doctor01.png"
    },
    {
        id: 3,
        name: "Dr. R Gupta",
        position: "Sr. Surgeon",
        speciality: "Dermatology",
        qualification: "MBBS, MD (Dermatology)",
        hospital: "Medanta Hospital, Indore",
        image: "./Doctor01.png"
    }
];

const DoctorLists = () => {
    const specialities = ["Orthopaedics", "Cardiology", "Dermatology", "Pediatrics", "Neurology"];

    const [filteredSpeciality, setFilteredSpeciality] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (query) => {
        setSearchQuery(query.toLowerCase());
    };

    const handleFilter = (speciality) => {
        setFilteredSpeciality(speciality);
    };

    const handleClear = () => {
        setSearchQuery("");
        setFilteredSpeciality("");
    };

    // **Filter Doctors Based on Search and Speciality**
    const filteredDoctors = doctors.filter((doc) => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery) || doc.speciality.toLowerCase().includes(searchQuery);
        const matchesSpeciality = filteredSpeciality ? doc.speciality === filteredSpeciality : true;
        return matchesSearch && matchesSpeciality;
    });

    return (
        <div className="p-6 grid md:grid-cols-4 sm:grid-cols-1 gap-6">
            {/* Left Side - Search & Filter */}
            <div className="col-span-1">
                <SearchFilter
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    specialities={specialities}
                    onClear={handleClear}
                />
            </div>

            {/* Right Side - Doctor Cards */}
            <div className="col-span-3 grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6 px-4">
                {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doc) => <DoctorCard key={doc.id} {...doc} />)
                ) : (
                    <p className="text-gray-500 text-lg col-span-3">No doctors found.</p>
                )}
            </div>
        </div>
    );
};

export default DoctorLists;
