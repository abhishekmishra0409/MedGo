import { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchFilter = ({
                          onSearch,
                          onFilter,
                          options,
                          onClear,
                          placeholder = "Search by name or keyword",
                          filterLabel = "Filter by",
                          optionType = "speciality" // default to 'speciality' for backward compatibility
                      }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOption, setSelectedOption] = useState("");

    // Handle search when Enter key is pressed
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [searchTerm]);

    const handleSearch = () => {
        onSearch(searchTerm);
    };

    const handleFilter = (e) => {
        setSelectedOption(e.target.value);
        onFilter(e.target.value);
    };

    const handleClearAll = () => {
        setSearchTerm("");
        setSelectedOption("");
        onClear();
    };

    return (
        <div className="bg-white shadow-md p-4 rounded-md w-full max-w-sm sticky top-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-blue-900">FILTERS</h3>
                <button
                    onClick={handleClearAll}
                    className="text-teal-500 text-sm hover:underline flex items-center gap-1"
                >
                    <FaTimes size={12} /> Clear all
                </button>
            </div>

            {/* Search Box */}
            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 pl-4 pr-10 focus:ring-2 focus:ring-teal-300 focus:border-teal-300"
                />
                <button
                    onClick={handleSearch}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-teal-300 to-teal-500 p-2 rounded-md text-white hover:from-teal-400 hover:to-teal-600 transition-colors"
                    aria-label="Search"
                >
                    <FaSearch />
                </button>
            </div>

            {/* Filter Dropdown */}
            <div>
                <label className="text-blue-900 font-semibold">{filterLabel}</label>
                <select
                    value={selectedOption}
                    onChange={handleFilter}
                    className="w-full border border-gray-300 rounded-md p-2 mt-1 focus:ring-2 focus:ring-teal-300 focus:border-teal-300"
                >
                    <option value="">All {optionType}s</option>
                    {options.map((option, index) => (
                        <option key={index} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default SearchFilter;