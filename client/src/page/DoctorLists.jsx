import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SearchFilter from "../component/Common/SearchFilter.jsx";
import DoctorCard from "../component/Common/DoctorCardModern.jsx";
import { fetchDoctors } from "../features/Doctor/DoctorSlice.js";

const DoctorLists = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { doctors, isLoading } = useSelector((state) => state.doctor);

    const [filteredSpeciality, setFilteredSpeciality] = useState(searchParams.get("speciality") || "");
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

    useEffect(() => {
        dispatch(
            fetchDoctors({
                search: searchQuery || undefined,
                specialty: filteredSpeciality || undefined,
            })
        );
    }, [dispatch, filteredSpeciality, searchQuery]);

    const specialities = useMemo(() => [...new Set(doctors.map((doctor) => doctor.specialty).filter(Boolean))], [doctors]);

    const filteredDoctors = useMemo(() => doctors, [doctors]);

    const syncSearchParams = (nextSearch, nextSpeciality) => {
        const params = new URLSearchParams();
        if (nextSearch) {
            params.set("search", nextSearch);
        }
        if (nextSpeciality) {
            params.set("speciality", nextSpeciality);
        }
        setSearchParams(params);
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        syncSearchParams(query, filteredSpeciality);
    };

    const handleFilter = (speciality) => {
        setFilteredSpeciality(speciality);
        syncSearchParams(searchQuery, speciality);
    };

    const handleClear = () => {
        setSearchQuery("");
        setFilteredSpeciality("");
        setSearchParams(new URLSearchParams());
    };

    return (
        <div className="section-shell space-y-8 py-10">
            <section className="hero-panel">
                <span className="eyebrow">Doctor discovery</span>
                <h1 className="section-title max-w-3xl">Find the right specialist with clearer context before booking.</h1>
                <p className="section-copy max-w-2xl">
                    Compare specialties, qualifications, and clinic locations in one focused directory built to reduce decision friction.
                </p>
            </section>

            <section className="grid gap-8 lg:grid-cols-[320px_1fr]">
                <SearchFilter
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    options={specialities}
                    onClear={handleClear}
                    initialSearch={searchQuery}
                    initialFilter={filteredSpeciality}
                    placeholder="Search doctors, specialties, or clinics"
                    filterLabel="Speciality"
                    optionType="speciality"
                />

                <div className="space-y-6">
                    <div className="section-heading-row">
                        <div>
                            <p className="eyebrow">Results</p>
                            <h2 className="text-2xl font-semibold text-slate-950">{filteredDoctors.length} doctors available</h2>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="h-72 animate-pulse rounded-[30px] bg-white shadow-sm" />
                            ))}
                        </div>
                    ) : filteredDoctors.length ? (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {filteredDoctors.map((doctor) => (
                                <DoctorCard
                                    key={doctor._id}
                                    id={doctor._id}
                                    image={doctor.image}
                                    name={doctor.name}
                                    specialty={doctor.specialty}
                                    qualification={doctor.qualification}
                                    hospital={doctor.contact?.address}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <h3 className="text-2xl font-semibold text-slate-950">No doctors matched your filters.</h3>
                            <p className="max-w-lg text-sm text-slate-600">Try a broader specialty or clear the filters to see the full care network.</p>
                            <button onClick={handleClear} className="btn-primary px-5 py-3 text-sm">
                                Reset filters
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default DoctorLists;
