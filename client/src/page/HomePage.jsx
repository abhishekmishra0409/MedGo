import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, HeartPulse, ShieldCheck, FlaskConical, ShoppingBag, Ambulance, CalendarRange } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDoctors } from "../features/Doctor/DoctorSlice.js";
import { fetchAllProducts } from "../features/Product/ProductSlice.js";
import { fetchAllBlogs } from "../features/Blog/BlogSlice.js";
import DoctorCard from "../component/Common/DoctorCardModern.jsx";
import ProductCard from "../component/Common/ProductCardModern.jsx";

const spotlightCards = [
    {
        title: "Urgent support",
        copy: "Route emergency needs faster with clearer action states and always-visible support paths.",
        icon: Ambulance,
        link: "/ambulance",
    },
    {
        title: "Specialist booking",
        copy: "Discover available doctors, review specialties, and move directly into booking flows.",
        icon: CalendarRange,
        link: "/doctorlists",
    },
    {
        title: "Trusted diagnostics",
        copy: "Compare lab tests, track bookings, and keep reports close to the rest of the patient journey.",
        icon: FlaskConical,
        link: "/labtestlists",
    },
];

const trustMetrics = [
    { label: "Care journeys", value: "3", detail: "doctor visits, diagnostics, and pharmacy in one place" },
    { label: "Always-on support", value: "24/7", detail: "clear emergency routing and account visibility" },
    { label: "Trust-first UI", value: "100%", detail: "designed for calmer healthcare decision making" },
];

const HomePage = () => {
    const dispatch = useDispatch();
    const { doctors, isLoading: doctorsLoading } = useSelector((state) => state.doctor);
    const { products, isLoading: productsLoading } = useSelector((state) => state.products);
    const { blogs, loading: blogsLoading } = useSelector((state) => state.blogs);

    useEffect(() => {
        dispatch(fetchDoctors());
        dispatch(fetchAllProducts());
        dispatch(fetchAllBlogs());
    }, [dispatch]);

    const featuredDoctors = useMemo(() => doctors.slice(0, 3), [doctors]);
    const featuredProducts = useMemo(() => {
        const hotProducts = products.filter((product) => product?.isHot);
        return (hotProducts.length ? hotProducts : products).slice(0, 4);
    }, [products]);
    const recentBlogs = useMemo(() => blogs.slice(0, 3), [blogs]);
    const isLoading = doctorsLoading || productsLoading || blogsLoading;

    return (
        <div className="space-y-10 pb-16">
            <section className="section-shell pt-8">
                <div className="hero-panel overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.25),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.14),_transparent_38%)]" />
                    <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                        <div className="space-y-6">
                            <span className="eyebrow">Clinical-modern care experience</span>
                            <h1 className="section-title max-w-3xl">
                                Healthcare discovery, booking, and follow-up that feels clear from the first click.
                            </h1>
                            <p className="section-copy max-w-2xl">
                                MedGo helps patients move from symptoms to specialists, from prescriptions to pharmacy orders, and from tests to reports without the usual fragmented experience.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link to="/doctorlists" className="btn-primary px-6 py-3 text-sm">
                                    Find doctors
                                </Link>
                                <Link to="/productlists" className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-teal-300">
                                    Order medicines
                                </Link>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {trustMetrics.map((metric) => (
                                    <div key={metric.label} className="rounded-3xl border border-white/70 bg-white/70 p-4 backdrop-blur">
                                        <p className="text-2xl font-semibold text-slate-950">{metric.value}</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-900">{metric.label}</p>
                                        <p className="mt-1 text-xs leading-6 text-slate-600">{metric.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-4">
                            <div className="surface-card bg-[linear-gradient(135deg,rgba(240,253,250,0.95),rgba(255,255,255,0.92))]">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="eyebrow">Care visibility</p>
                                        <h2 className="mt-2 text-2xl font-semibold text-slate-950">One home for consultations, diagnostics, and pharmacy.</h2>
                                    </div>
                                    <ShieldCheck className="h-9 w-9 text-teal-700" />
                                </div>
                                <div className="mt-6 grid gap-3">
                                    {[
                                        "Track appointment status and next actions",
                                        "Keep lab bookings and reports connected to your account",
                                        "Move from discovery into checkout without context switching",
                                    ].map((item) => (
                                        <div key={item} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
                                            <HeartPulse className="h-4 w-4 text-teal-700" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="surface-card">
                                    <p className="text-sm font-semibold text-slate-900">Appointments</p>
                                    <p className="mt-2 text-sm text-slate-600">Discover, compare, and book with clearer service boundaries.</p>
                                </div>
                                <div className="surface-card">
                                    <p className="text-sm font-semibold text-slate-900">Diagnostics</p>
                                    <p className="mt-2 text-sm text-slate-600">Lab tests, booking timelines, and reports stay attached to the patient journey.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-shell">
                <div className="grid gap-5 lg:grid-cols-3">
                    {spotlightCards.map((card) => (
                        <Link key={card.title} to={card.link} className="surface-card group">
                            <div className="flex items-center justify-between">
                                <card.icon className="h-10 w-10 text-teal-700" />
                                <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-700" />
                            </div>
                            <h2 className="mt-6 text-xl font-semibold text-slate-950">{card.title}</h2>
                            <p className="mt-3 text-sm leading-7 text-slate-600">{card.copy}</p>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="section-shell">
                <div className="section-heading-row">
                    <div>
                        <p className="eyebrow">Doctors</p>
                        <h2 className="text-3xl font-semibold text-slate-950">Trusted specialists ready for discovery.</h2>
                    </div>
                    <Link to="/doctorlists" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
                        View all doctors
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {featuredDoctors.map((doctor) => (
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
            </section>

            <section className="section-shell">
                <div className="section-heading-row">
                    <div>
                        <p className="eyebrow">Pharmacy</p>
                        <h2 className="text-3xl font-semibold text-slate-950">Featured products from the store experience.</h2>
                    </div>
                    <Link to="/productlists" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
                        Explore pharmacy
                        <ShoppingBag className="h-4 w-4" />
                    </Link>
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {featuredProducts.map((product) => (
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
            </section>

            <section className="section-shell">
                <div className="rounded-[40px] bg-slate-950 px-6 py-10 text-white md:px-10">
                    <div className="section-heading-row gap-6">
                        <div>
                            <p className="eyebrow text-teal-300">Signals of trust</p>
                            <h2 className="text-3xl font-semibold">Why the redesign focuses on clarity first.</h2>
                        </div>
                        <p className="max-w-2xl text-sm leading-7 text-slate-300">
                            Healthcare products work better when the interface reduces hesitation. These improvements make actions, status, and next steps more obvious across the entire journey.
                        </p>
                    </div>
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                            <HeartPulse className="h-8 w-8 text-teal-300" />
                            <h3 className="mt-4 text-lg font-semibold">Trustworthy first contact</h3>
                            <p className="mt-2 text-sm leading-7 text-slate-300">Cleaner navigation, calmer color usage, and stronger public-page hierarchy.</p>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                            <FlaskConical className="h-8 w-8 text-teal-300" />
                            <h3 className="mt-4 text-lg font-semibold">Status visibility</h3>
                            <p className="mt-2 text-sm leading-7 text-slate-300">Appointments, orders, and diagnostics are easier to track across account areas.</p>
                        </div>
                        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                            <ShieldCheck className="h-8 w-8 text-teal-300" />
                            <h3 className="mt-4 text-lg font-semibold">Operational consistency</h3>
                            <p className="mt-2 text-sm leading-7 text-slate-300">Shared visual patterns reduce guesswork for both patients and administrators.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-shell">
                <div className="section-heading-row">
                    <div>
                        <p className="eyebrow">Insights</p>
                        <h2 className="text-3xl font-semibold text-slate-950">Recent health content from the blog.</h2>
                    </div>
                    <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800">
                        Read all posts
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {recentBlogs.map((blog) => (
                        <Link key={blog._id} to={`/blog/${blog._id}`} className="surface-card group">
                            <div className="overflow-hidden rounded-[28px] bg-slate-100">
                                <img
                                    src={blog.image || "/blog/Blogmain.jpg"}
                                    alt={blog.title}
                                    className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                            </div>
                            <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-500">
                                <span>{blog.author?.name || "MedGo team"}</span>
                                <span>•</span>
                                <span>{blog.date ? new Date(blog.date).toLocaleDateString() : "Recently added"}</span>
                            </div>
                            <h3 className="mt-3 text-xl font-semibold text-slate-950">{blog.title}</h3>
                            <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{blog.description}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {isLoading && (
                <div className="section-shell">
                    <div className="surface-card text-sm text-slate-600">Refreshing doctors, products, and articles...</div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
