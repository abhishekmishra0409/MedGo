import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllTests } from "../features/Labtest/LabtestSlice.js";
import SearchFilter from "../component/Common/SearchFilter.jsx";
import LabCard from "../component/Common/LabCardModern.jsx";

const LabTestList = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { tests, isLoading, isError, message } = useSelector((state) => state.labTest);
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [category, setCategory] = useState(searchParams.get("category") || "");

    useEffect(() => {
        dispatch(
            fetchAllTests({
                search: searchQuery || undefined,
                category: category || undefined,
            })
        );
    }, [category, dispatch, searchQuery]);

    const categories = useMemo(() => [...new Set(tests.map((test) => test.category).filter(Boolean))], [tests]);

    const syncSearchParams = (nextSearch, nextCategory) => {
        const params = new URLSearchParams();
        if (nextSearch) {
            params.set("search", nextSearch);
        }
        if (nextCategory) {
            params.set("category", nextCategory);
        }
        setSearchParams(params);
    };

    const filteredTests = useMemo(() => tests, [tests]);

    return (
        <div className="section-shell space-y-8 py-10">
            <section className="hero-panel">
                <span className="eyebrow">Diagnostics discovery</span>
                <h1 className="section-title max-w-3xl">Book lab tests with clearer category filters and pricing context.</h1>
                <p className="section-copy max-w-2xl">Move from browsing to booking faster, with report timing and preparation guidance visible before checkout.</p>
            </section>

            <section className="grid gap-8 lg:grid-cols-[320px_1fr]">
                <SearchFilter
                    onSearch={(value) => {
                        setSearchQuery(value);
                        syncSearchParams(value, category);
                    }}
                    onFilter={(value) => {
                        setCategory(value);
                        syncSearchParams(searchQuery, value);
                    }}
                    options={categories}
                    onClear={() => {
                        setSearchQuery("");
                        setCategory("");
                        setSearchParams(new URLSearchParams());
                    }}
                    initialSearch={searchQuery}
                    initialFilter={category}
                    placeholder="Search tests, body systems, or conditions"
                    filterLabel="Categories"
                    optionType="category"
                />

                <div className="space-y-6">
                    <div className="section-heading-row">
                        <div>
                            <p className="eyebrow">Results</p>
                            <h2 className="text-2xl font-semibold text-slate-950">{filteredTests.length} lab tests available</h2>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="h-72 animate-pulse rounded-[30px] bg-white shadow-sm" />
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="empty-state text-red-600">{message}</div>
                    ) : filteredTests.length ? (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {filteredTests.map((test) => (
                                <LabCard key={test._id} test={test} />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <h3 className="text-2xl font-semibold text-slate-950">No lab tests matched your search.</h3>
                            <p className="max-w-lg text-sm text-slate-600">Try a broader condition or clear the filters to view the full diagnostics catalog.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default LabTestList;
