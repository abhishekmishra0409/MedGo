import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FiBook, FiBriefcase, FiCalendar, FiClock, FiHome, FiLogOut, FiMenu, FiUser, FiX } from "react-icons/fi";
import { PiFlask } from "react-icons/pi";
import { MdOutlineMessage } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { logoutDoctor } from "../../features/Doctor/DoctorSlice.js";
import NotificationBell from "../../component/Notifications/NotificationBell.jsx";

const menuItems = [
    { icon: <FiUser className="text-lg" />, label: "Profile", path: "" },
    { icon: <FiBriefcase className="text-lg" />, label: "Professional Details", path: "professional-details" },
    { icon: <FiHome className="text-lg" />, label: "Clinic", path: "clinic" },
    { icon: <FiBook className="text-lg" />, label: "Blogs", path: "blogs" },
    { icon: <FiCalendar className="text-lg" />, label: "Appointments", path: "appointments" },
    { icon: <FiClock className="text-lg" />, label: "Availability", path: "availability" },
    { icon: <PiFlask className="text-lg" />, label: "LabTest", path: "labtest" },
    { icon: <MdOutlineMessage className="text-lg" />, label: "Messages", path: "messages" },
    { icon: <FiLogOut className="text-lg" />, label: "Logout", path: "/logout" },
];

const DashboardModern = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { profile } = useSelector((state) => state.doctor);

    const handleNavigation = (path) => {
        if (path === "/logout") {
            dispatch(logoutDoctor())
                .unwrap()
                .then(() => navigate("/login?role=doctor"));
            return;
        }

        navigate(path);
    };

    const isActive = (path) => {
        if (!path) {
            return location.pathname === "/doctor" || location.pathname === "/doctor/";
        }
        return location.pathname.includes(`/doctor/${path}`);
    };

    return (
        <div className="relative flex h-dvh w-full overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#f4f8fb_100%)]">
            <button
                onClick={() => setIsSidebarOpen((value) => !value)}
                className="fixed left-4 top-4 z-50 rounded-full border border-slate-200 bg-white p-3 shadow-sm md:hidden"
                type="button"
                aria-label="Toggle sidebar"
            >
                {isSidebarOpen ? <FiX /> : <FiMenu />}
            </button>

            {isSidebarOpen ? (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    className="fixed inset-0 z-30 bg-slate-950/30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            ) : null}

            <aside
                className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-[min(17rem,85vw)] transform border-r border-slate-200 bg-white/95 transition-transform duration-200 ease-in-out md:static md:translate-x-0`}
            >
                <div className="flex h-full flex-col overflow-hidden px-4 py-4">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))] text-white shadow-[0_18px_40px_rgba(13,148,136,0.18)]">
                            <FiBook className="text-lg" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Doctor workspace</p>
                            <p className="truncate text-sm text-slate-500">Care work and communication</p>
                        </div>
                    </div>

                    {profile ? (
                        <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                                    <span className="font-semibold">{profile.name ? profile.name.charAt(0).toUpperCase() : "D"}</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate font-medium text-slate-800">{profile.name || "Doctor"}</p>
                                    <p className="truncate text-sm text-slate-500">{profile.email || ""}</p>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <nav className="flex-1">
                        <ul className="space-y-1.5">
                            {menuItems.map((item) => (
                                <li key={item.label}>
                                    <button
                                        type="button"
                                        onClick={() => handleNavigation(item.path)}
                                        className={`w-full rounded-2xl px-3 py-2.5 text-left transition ${
                                            isActive(item.path) ? "bg-teal-50 text-teal-800" : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </aside>

            <main className="modal-scroll h-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden pt-16 md:pt-0">
                <div className="w-full p-4 md:p-6 xl:p-8">
                    <div className="mb-4 flex justify-end">
                        <NotificationBell tokenKey="doctorToken" />
                    </div>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardModern;
