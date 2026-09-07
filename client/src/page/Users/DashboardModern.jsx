import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FiUser, FiShoppingBag, FiCalendar, FiLogOut, FiMenu, FiX, FiHome } from "react-icons/fi";
import { PiFlask } from "react-icons/pi";
import { MdOutlineMessage } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../features/User/UserSlice.js";
import NotificationBell from "../../component/Notifications/NotificationBell.jsx";

const menuItems = [
    { icon: <FiHome className="text-lg" />, label: "Back to website", path: "/" },
    { icon: <FiUser className="text-lg" />, label: "Profile", path: "" },
    { icon: <FiShoppingBag className="text-lg" />, label: "Orders", path: "orders" },
    { icon: <FiCalendar className="text-lg" />, label: "Appointments", path: "appointments" },
    { icon: <PiFlask className="text-lg" />, label: "LabTest", path: "labtest" },
    { icon: <MdOutlineMessage className="text-lg" />, label: "Messages", path: "messages" },
    { icon: <FiLogOut className="text-lg" />, label: "Logout", path: "/logout" },
];

const DashboardModern = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { profile } = useSelector((state) => state.auth);

    const handleNavigation = (path) => {
        if (path === "/logout") {
            dispatch(logoutUser())
                .unwrap()
                .then(() => navigate("/login"));
            return;
        }

        navigate(path);
    };

    const isActive = (path) => {
        if (!path) {
            return location.pathname === "/user" || location.pathname === "/user/";
        }
        return location.pathname.includes(`/user/${path}`);
    };

    return (
        <div className="relative flex min-h-dvh w-full bg-[linear-gradient(180deg,#f7fbff_0%,#eef8f6_100%)]">
            <button onClick={() => setIsSidebarOpen((value) => !value)} className="md:hidden fixed left-4 top-4 z-50 rounded-full border border-slate-200 bg-white p-3 shadow-sm">
                {isSidebarOpen ? <FiX /> : <FiMenu />}
            </button>

            {isSidebarOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    className="fixed inset-0 z-30 bg-slate-950/30 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <aside
                className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-[min(17rem,85vw)] transform border-r border-slate-200 bg-white/95 transition-transform duration-200 ease-in-out md:translate-x-0`}
            >
                <div className="flex h-full flex-col overflow-hidden px-4 py-4">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))] text-white shadow-[0_18px_40px_rgba(13,148,136,0.18)]">
                            <FiUser className="text-lg" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Patient hub</p>
                            <p className="truncate text-sm text-slate-500">Care history and next steps</p>
                        </div>
                    </div>

                    {profile && (
                        <div className="mb-5 rounded-3xl border border-slate-200 bg-slate-50 p-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                                    <span className="font-semibold">{profile.username ? profile.username.charAt(0).toUpperCase() : "U"}</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate font-medium text-slate-800">{profile.username || "User"}</p>
                                    <p className="truncate text-sm text-slate-500">{profile.email || ""}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <nav className="flex-1">
                        <ul className="space-y-1.5">
                            {menuItems.map((item) => (
                                <li key={item.label}>
                                    <button
                                        onClick={() => handleNavigation(item.path)}
                                        className={`w-full rounded-2xl px-3 py-2.5 text-left transition ${isActive(item.path) ? "bg-teal-50 text-teal-800" : "text-slate-700 hover:bg-slate-50"
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

            <main className="min-w-0 flex-1 md:ml-[min(17rem,85vw)]">
                <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-end border-b border-slate-200 bg-white/90 px-4 backdrop-blur-sm md:left-[min(17rem,85vw)] md:px-6 xl:px-8">
                    <NotificationBell tokenKey="userToken" />
                </header>

                <div className="w-full p-4 pt-20 md:p-6 md:pt-[5.5rem] xl:p-8 xl:pt-24">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardModern;
