import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Check, Clock, Edit3, FlaskConical, IndianRupee, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState, PageHeader, SearchInput, StatusPill } from "../../components/AdminUI.jsx";
import { createTest, deactivateTest, getAllTests, resetTestState, updateTest } from "../../features/Tests/TestSlice";
import TestModal from "./TestModal";

const TestsPage = () => {
    const dispatch = useDispatch();
    const { tests = [], isLoading, isError, isSuccess, message } = useSelector((state) => state.test);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTest, setSelectedTest] = useState(null);
    const [expandedTest, setExpandedTest] = useState(null);

    useEffect(() => {
        dispatch(getAllTests());
        return () => dispatch(resetTestState());
    }, [dispatch]);

    useEffect(() => {
        if (isError) toast.error(message);
        if (isSuccess && message) {
            toast.success(message);
            dispatch(getAllTests());
        }
    }, [isError, isSuccess, message, dispatch]);

    const filteredTests = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return tests.filter((test) =>
            !query ||
            (test.name || "").toLowerCase().includes(query) ||
            (test.code || "").toLowerCase().includes(query) ||
            (test.category || "").toLowerCase().includes(query)
        );
    }, [searchTerm, tests]);

    const handleDeactivate = (id) => {
        if (!window.confirm("Are you sure you want to change this test status?")) return;
        dispatch(deactivateTest(id));
    };

    const handleSubmitTest = async ({ id, testData }) => {
        try {
            if (id) {
                await dispatch(updateTest({ id, testData })).unwrap();
                toast.success("Test updated successfully");
            } else {
                await dispatch(createTest(testData)).unwrap();
                toast.success("Test registered successfully");
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.message || "Failed to save test");
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Diagnostics"
                title="Lab tests"
                description="Manage diagnostic tests, report timing, pricing, and preparation instructions."
                action={(
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedTest(null);
                            setIsModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add test
                    </button>
                )}
            />

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search tests by name, code, or category..." />

                {isLoading ? (
                    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {[1, 2, 3].map((item) => <div key={item} className="h-44 animate-pulse rounded-3xl bg-slate-100" />)}
                    </div>
                ) : filteredTests.length ? (
                    <div className="mt-5 grid gap-4 xl:grid-cols-2">
                        {filteredTests.map((test) => {
                            const expanded = expandedTest === test._id;
                            return (
                                <article key={test._id} className="rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-teal-200 hover:shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                                            <FlaskConical className="h-7 w-7" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-lg font-bold text-slate-950">{test.name || "Unnamed test"}</h2>
                                                <StatusPill tone="teal">{test.code || "Code N/A"}</StatusPill>
                                                <StatusPill tone="slate">{test.category || "Uncategorized"}</StatusPill>
                                                <StatusPill tone={test.isActive ? "emerald" : "rose"}>{test.isActive ? "Active" : "Inactive"}</StatusPill>
                                            </div>
                                            <p className="mt-2 line-clamp-2 text-sm text-slate-600">{test.description || "No description provided."}</p>
                                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5"><IndianRupee className="h-4 w-4 text-teal-700" />{Number(test.price || 0).toFixed(2)}</span>
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5"><Clock className="h-4 w-4 text-teal-700" />Report in {test.reportTime || "N/A"} hours</span>
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 flex-col gap-2">
                                            <button type="button" onClick={() => setExpandedTest(expanded ? null : test._id)} className="rounded-xl border border-teal-200 px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50">
                                                {expanded ? "Hide" : "Details"}
                                            </button>
                                            <button type="button" onClick={() => { setSelectedTest(test); setIsModalOpen(true); }} className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-200 text-teal-700 hover:bg-teal-50" aria-label="Edit test">
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                            <button type="button" onClick={() => handleDeactivate(test._id)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50" aria-label={test.isActive ? "Deactivate test" : "Activate test"}>
                                                {test.isActive ? <Trash2 className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {expanded ? (
                                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <h3 className="text-sm font-bold text-slate-950">Preparation instructions</h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">{test.preparationInstructions || "No special preparation required."}</p>
                                        </div>
                                    ) : null}
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-5">
                        <EmptyState icon={<FlaskConical className="h-7 w-7" />} title="No tests found" description="Try another search or add a diagnostic test." />
                    </div>
                )}
            </section>

            <TestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} test={selectedTest} onSubmit={handleSubmitTest} isLoading={isLoading} />
        </div>
    );
};

export default TestsPage;
