import React, { useState, useEffect } from "react";
import SearchFilter from "../component/Common/SearchFilter.jsx";
import DoctorCard from "../component/Common/DoctorCard.jsx";
import { Doctors } from "../assets/DoctorData.js";

const DoctorLists = () => {
    // Extract unique specialities from doctors data
    const specialities = [...new Set(Doctors.map(doctor => doctor.specialty))];

    const [filteredSpeciality, setFilteredSpeciality] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Simulate loading state
    useEffect(() => {
        if (searchQuery || filteredSpeciality) {
            setIsLoading(true);
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [searchQuery, filteredSpeciality]);

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

    // Filter Doctors Based on Search and Speciality
    const filteredDoctors = Doctors.filter((doctor) => {
        const matchesSearch =
            doctor.name.toLowerCase().includes(searchQuery) ||
            doctor.specialty.toLowerCase().includes(searchQuery) ||
            doctor.contact.address.toLowerCase().includes(searchQuery);
        const matchesSpeciality = filteredSpeciality ?
            doctor.specialty === filteredSpeciality : true;
        return matchesSearch && matchesSpeciality;
    });


    return (
        <>
            <div className="relative w-full h-[350px] bg-cover bg-center flex items-center justify-center"
                 style={{backgroundImage: "url('/hero_healthcare.png')"}}>
                <div className="">
                    <h1 className="text-4xl font-bold text-gray-900">Find Your Doctor</h1>
                </div>
            </div>

            <div className="container mx-auto p-6 bg-gradient-to-b from-gray-100 to-white">
                {/*<h1 className="text-3xl font-bold text-gray-800 mb-8">Find Your Doctor</h1>*/}

                <div className="grid md:grid-cols-4 sm:grid-cols-1 gap-8 mt-16">
                    {/* Left Side - Search & Filter */}
                    <div className="col-span-1">
                        <SearchFilter
                            onSearch={handleSearch}
                            onFilter={handleFilter}
                            options={specialities}
                            onClear={handleClear}
                            placeholder="Search doctors..."
                        filterLabel="Speciality"
                        optionType="speciality"
                    />
                </div>

                {/* Right Side - Doctor Cards */}
                <div className="col-span-3">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                        </div>
                    ) : filteredDoctors.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDoctors.map((doctor) => (
                                <DoctorCard
                                    id={doctor.id}
                                    key={doctor.id}
                                    image={doctor.image}
                                    name={doctor.name}
                                    specialty={doctor.specialty}
                                    qualification={doctor.qualification}
                                    rating={doctor.rating}
                                    reviews={doctor.reviews}
                                    hospital={doctor.contact.address}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                            <h3 className="text-xl font-medium text-gray-600 mb-2">No doctors found</h3>
                            <p className="text-gray-500">
                                {searchQuery || filteredSpeciality
                                    ? "Try adjusting your search or filter criteria"
                                    : "Currently no doctors available in this category"}
                            </p>
                            <button
                                onClick={handleClear}
                                className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                            >
                                Clear filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
};

export default DoctorLists;