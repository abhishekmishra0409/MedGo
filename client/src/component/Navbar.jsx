import { useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingCart, UserRound, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../features/User/UserSlice";
import { logoutDoctor } from "../features/Doctor/DoctorSlice";

const navLinks = [
    { to: "/doctorlists", label: "Doctors" },
    { to: "/productlists", label: "Pharmacy" },
    { to: "/labtestlists", label: "Lab Tests" },
    { to: "/blogs", label: "Blogs" },
    { to: "/ambulance", label: "Emergency" },
];

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { profile: userProfile, isAuthenticated: userAuthenticated } = useSelector((state) => state.auth);
    const { profile: doctorProfile, isAuthenticated: doctorAuthenticated } = useSelector((state) => state.doctor);
    const [showDropdown, setShowDropdown] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const session = useMemo(() => {
        if (userAuthenticated && userProfile) {
            return { role: "user", profile: userProfile };
        }

        if (doctorAuthenticated && doctorProfile) {
            return { role: "doctor", profile: doctorProfile };
        }

        return null;
    }, [doctorAuthenticated, doctorProfile, userAuthenticated, userProfile]);

    const handleLogout = () => {
        if (session?.role === "user") {
            dispatch(logoutUser());
        } else if (session?.role === "doctor") {
            dispatch(logoutDoctor());
        }

        setShowDropdown(false);
        setMenuOpen(false);
        navigate(`/login?role=${session?.role || "user"}`);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        const query = searchQuery.trim();

        navigate(query ? `/search?q=${encodeURIComponent(query)}` : "/search");
        setMenuOpen(false);
    };

    const dashboardLinks =
        session?.role === "doctor"
            ? [
                  { to: "/doctor", label: "Profile" },
                  { to: "/doctor/appointments", label: "Appointments" },
                  { to: "/doctor/blogs", label: "Blogs" },
                  { to: "/doctor/labtest", label: "Lab bookings" },
              ]
            : [
                  { to: "/user", label: "Profile" },
                  { to: "/user/orders", label: "Orders" },
                  { to: "/user/appointments", label: "Appointments" },
                  { to: "/user/labtest", label: "Lab bookings" },
              ];

    return (
        <header className="sticky top-0 z-40 border-b border-white/70 bg-white/80 backdrop-blur-xl">
            <div className="section-shell py-4">
                <div className="flex items-center justify-between gap-4">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))] shadow-[0_18px_40px_rgba(13,148,136,0.18)]">
                            <img src="/android-icon-192x192.png" alt="MedGo" className="h-9 w-9 rounded-xl" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">MedGo</p>
                            <p className="text-sm text-slate-500">Clinical care, pharmacy and diagnostics</p>
                        </div>
                    </Link>

                    <form onSubmit={handleSearchSubmit} className="hidden min-w-0 flex-1 items-center md:flex">
                        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <Search className="h-5 w-5 text-slate-400" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search doctors, medicines, or lab tests"
                                className="w-full border-0 bg-transparent text-sm text-slate-700 outline-none"
                            />
                            <button type="submit" className="rounded-full bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700">
                                Search
                            </button>
                        </div>
                    </form>

                    <div className="hidden items-center gap-3 lg:flex">
                        <nav className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1">
                            {navLinks.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `rounded-full px-4 py-2 text-sm font-medium transition ${
                                            isActive ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-950"
                                        }`
                                    }
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        {session?.role === "user" && (
                            <Link to="/cart" className="rounded-full border border-slate-200 bg-white p-3 text-slate-600 transition hover:border-teal-200 hover:text-teal-700">
                                <ShoppingCart className="h-5 w-5" />
                            </Link>
                        )}

                        {session ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowDropdown((value) => !value)}
                                    className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm transition hover:border-teal-200"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-semibold text-teal-800">
                                        {(session.profile?.username || session.profile?.name || "M").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-slate-900">{session.profile?.username || session.profile?.name || "My account"}</p>
                                        <p className="text-xs text-slate-500">{session.role === "doctor" ? "Doctor dashboard" : "Patient account"}</p>
                                    </div>
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl">
                                        <div className="mb-2 rounded-2xl bg-slate-50 p-4">
                                            <p className="text-sm font-semibold text-slate-900">{session.profile?.email || "Signed in"}</p>
                                            <p className="text-xs text-slate-500">Access your records, appointments, and communication hub.</p>
                                        </div>
                                        <div className="space-y-1">
                                            {dashboardLinks.map((item) => (
                                                <Link
                                                    key={item.to}
                                                    to={item.to}
                                                    onClick={() => setShowDropdown(false)}
                                                    className="block rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                                >
                                                    {item.label}
                                                </Link>
                                            ))}
                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="btn-primary px-5 py-3 text-sm"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => setMenuOpen((value) => !value)}
                        className="rounded-full border border-slate-200 bg-white p-3 text-slate-700 shadow-sm lg:hidden"
                    >
                        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {menuOpen && (
                    <div className="mt-4 space-y-4 rounded-[32px] border border-slate-200 bg-white p-5 shadow-2xl lg:hidden">
                        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                            <Search className="h-5 w-5 text-slate-400" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Search services"
                                className="w-full border-0 bg-transparent text-sm outline-none"
                            />
                        </form>

                        <nav className="grid gap-2">
                            {navLinks.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setMenuOpen(false)}
                                    className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>

                        {session ? (
                            <div className="space-y-2 rounded-2xl bg-slate-50 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                                        <UserRound className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">{session.profile?.username || session.profile?.name || "My account"}</p>
                                        <p className="text-xs text-slate-500">{session.profile?.email || "Account access"}</p>
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    {dashboardLinks.map((item) => (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            onClick={() => setMenuOpen(false)}
                                            className="rounded-2xl bg-white px-4 py-3 text-sm font-medium text-slate-700"
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                    <button
                                        onClick={handleLogout}
                                        className="rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setMenuOpen(false)}
                                className="btn-primary block rounded-2xl px-4 py-3 text-center text-sm"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
