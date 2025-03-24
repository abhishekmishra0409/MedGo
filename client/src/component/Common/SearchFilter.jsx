import { useState } from "react";
import { FaSearch } from "react-icons/fa";

const SearchFilter = ({ onSearch, onFilter, specialities, onClear }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSpeciality, setSelectedSpeciality] = useState("");

    const handleSearch = () => {
        onSearch(searchTerm);
    };

    const handleFilter = (e) => {
        setSelectedSpeciality(e.target.value);
        onFilter(e.target.value);
    };

    return (
        <div className="bg-white shadow-md p-4 rounded-md w-full max-w-sm">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-blue-900">FILTERS</h3>
                <button onClick={onClear} className="text-teal-500 text-sm hover:underline">
                    Clear all
                </button>
            </div>

            {/* Search Box */}
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Search by name or keyword"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 pl-4"
                />
                <button
                    onClick={handleSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-teal-300 to-teal-500 p-2 rounded-md text-white"
                >
                    <FaSearch />
                </button>
            </div>

            {/* Speciality Filter */}
            <div>
                <label className="text-blue-900 font-semibold">Speciality</label>
                <select
                    value={selectedSpeciality}
                    onChange={handleFilter}
                    className="w-full border border-gray-300 rounded-md p-2 mt-1"
                >
                    <option value="">Select Speciality</option>
                    {specialities.map((speciality, index) => (
                        <option key={index} value={speciality}>
                            {speciality}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default SearchFilter;
