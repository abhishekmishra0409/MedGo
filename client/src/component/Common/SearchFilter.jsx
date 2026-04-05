import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";

const SearchFilter = ({
    onSearch,
    onFilter,
    options,
    onClear,
    initialSearch = "",
    initialFilter = "",
    placeholder = "Search by name or keyword",
    filterLabel = "Filter by",
    optionType = "category",
}) => {
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [selectedOption, setSelectedOption] = useState(initialFilter);

    useEffect(() => {
        setSearchTerm(initialSearch);
    }, [initialSearch]);

    useEffect(() => {
        setSelectedOption(initialFilter);
    }, [initialFilter]);

    const handleSearch = () => {
        onSearch(searchTerm.trim());
    };

    const handleFilterChange = (event) => {
        const value = event.target.value;
        setSelectedOption(value);
        onFilter(value);
    };

    const handleClearAll = () => {
        setSearchTerm("");
        setSelectedOption("");
        onClear();
    };

    return (
        <aside className="sticky top-28 rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <p className="eyebrow">Filters</p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">Narrow the result set</h3>
                </div>
                <button onClick={handleClearAll} className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-rose-600">
                    <X className="h-4 w-4" />
                    Clear
                </button>
            </div>

            <div className="mt-6 space-y-5">
                <label className="block text-sm font-medium text-slate-700">
                    Search
                    <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    handleSearch();
                                }
                            }}
                            className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none"
                        />
                    </div>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                    {filterLabel}
                    <select
                        value={selectedOption}
                        onChange={handleFilterChange}
                        className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-teal-500"
                    >
                        <option value="">All {optionType}s</option>
                        {options.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </label>

                <button onClick={handleSearch} className="w-full rounded-2xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700">
                    Apply search
                </button>
            </div>
        </aside>
    );
};

export default SearchFilter;
