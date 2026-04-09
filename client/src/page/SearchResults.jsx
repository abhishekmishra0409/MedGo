import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Stethoscope, ShoppingBag, FlaskConical } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctors } from "../features/Doctor/DoctorSlice.js";
import { fetchAllProducts } from "../features/Product/ProductSlice.js";
import { fetchAllTests } from "../features/Labtest/LabtestSlice.js";
import DoctorCard from "../component/Common/DoctorCardModern.jsx";
import ProductCard from "../component/Common/ProductCardModern.jsx";
import LabCard from "../component/Common/LabCardModern.jsx";

const SearchResults = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const query = (searchParams.get("q") || "").trim();

    const { doctors } = useSelector((state) => state.doctor);
    const { products } = useSelector((state) => state.products);
    const { tests } = useSelector((state) => state.labTest);

    useEffect(() => {
        if (!query) {
            return;
        }

        dispatch(fetchDoctors({ search: query }));
        dispatch(fetchAllProducts({ search: query }));
        dispatch(fetchAllTests({ search: query }));
    }, [dispatch, query]);

    const doctorMatches = useMemo(() => doctors, [doctors]);

    const productMatches = useMemo(() => products, [products]);

    const testMatches = useMemo(() => tests, [tests]);

    const totalResults = doctorMatches.length + productMatches.length + testMatches.length;

    return (
        <div className="section-shell space-y-10 py-10">
            <section className="hero-panel overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.18),_transparent_45%),radial-gradient(circle_at_bottom_left,_rgba(13,148,136,0.2),_transparent_35%)]" />
                <div className="relative space-y-4">
                    <span className="eyebrow">Unified Search</span>
                    <h1 className="section-title">Find doctors, medicines, and diagnostics in one place.</h1>
                    <p className="section-copy max-w-2xl">
                        Search results are grouped by care journey so users can move from discovery into booking, shopping, or lab booking without guessing where to go next.
                    </p>
                    <div className="flex items-start gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-4 text-sm text-slate-700 backdrop-blur sm:items-center">
                        <Search className="h-5 w-5 shrink-0 text-teal-700" />
                        <span className="min-w-0 break-words">
                            Showing <strong>{totalResults}</strong> result{totalResults === 1 ? "" : "s"} for <strong>{query || "all services"}</strong>
                        </span>
                    </div>
                </div>
            </section>

            {!query ? (
                <section className="empty-state">
                    <Search className="h-10 w-10 text-teal-700" />
                    <h2 className="text-2xl font-semibold text-slate-900">Start with a symptom, specialty, or product name.</h2>
                    <p className="max-w-xl text-sm text-slate-600">
                        Try searches like "cardiology", "thyroid", or "pain relief" to explore services across MedGo.
                    </p>
                </section>
            ) : (
                <>
                    <section className="space-y-5">
                        <div className="section-heading-row">
                            <div>
                                <p className="eyebrow">Doctors</p>
                                <h2 className="text-2xl font-semibold text-slate-950">Medical specialists</h2>
                            </div>
                            <Link to={`/doctorlists?search=${encodeURIComponent(query)}`} className="text-sm font-semibold text-teal-800">
                                Browse all doctors
                            </Link>
                        </div>
                        {doctorMatches.length ? (
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {doctorMatches.slice(0, 6).map((doctor) => (
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
                            <div className="surface-card flex items-center gap-3 text-sm text-slate-600">
                                <Stethoscope className="h-5 w-5 text-teal-700" />
                                No doctors matched this search.
                            </div>
                        )}
                    </section>

                    <section className="space-y-5">
                        <div className="section-heading-row">
                            <div>
                                <p className="eyebrow">Pharmacy</p>
                                <h2 className="text-2xl font-semibold text-slate-950">Products and medicines</h2>
                            </div>
                            <Link to={`/productlists?search=${encodeURIComponent(query)}`} className="text-sm font-semibold text-teal-800">
                                Browse all products
                            </Link>
                        </div>
                        {productMatches.length ? (
                            <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                                {productMatches.slice(0, 8).map((product) => (
                                    <ProductCard
                                        key={product._id}
                                        id={product._id}
                                        image={product.image}
                                        name={product.name}
                                        price={product.price}
                                        originalPrice={product.originalPrice}
                                        isHot={product.isHot}
                                        isNew={product.isNew}
                                        category={product.category}
                                        rating={product.rating}
                                        reviews={product.reviews}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="surface-card flex items-center gap-3 text-sm text-slate-600">
                                <ShoppingBag className="h-5 w-5 text-teal-700" />
                                No products matched this search.
                            </div>
                        )}
                    </section>

                    <section className="space-y-5">
                        <div className="section-heading-row">
                            <div>
                                <p className="eyebrow">Diagnostics</p>
                                <h2 className="text-2xl font-semibold text-slate-950">Lab tests and screening</h2>
                            </div>
                            <Link to={`/labtestlists?search=${encodeURIComponent(query)}`} className="text-sm font-semibold text-teal-800">
                                Browse all lab tests
                            </Link>
                        </div>
                        {testMatches.length ? (
                            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                                {testMatches.slice(0, 6).map((test) => (
                                    <LabCard key={test._id} test={test} />
                                ))}
                            </div>
                        ) : (
                            <div className="surface-card flex items-center gap-3 text-sm text-slate-600">
                                <FlaskConical className="h-5 w-5 text-teal-700" />
                                No lab tests matched this search.
                            </div>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default SearchResults;
