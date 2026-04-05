import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FiUser, FiShoppingBag, FiCalendar, FiLogOut, FiMenu, FiX, FiHome } from "react-icons/fi";
import { PiFlask } from "react-icons/pi";
import { MdOutlineMessage } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../features/User/UserSlice.js";

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
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { profile } = useSelector((state) => state.auth);

    const handleNavigation = (path) => {
        if (path === "/logout") {
            dispatch(logoutUser())
                .unwrap()
                .then(() => navigate("/login?role=user"));
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
        <div className="flex min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef8f6_100%)]">
            <button onClick={() => setIsSidebarOpen((value) => !value)} className="md:hidden fixed left-4 top-4 z-50 rounded-full border border-slate-200 bg-white p-3 shadow-sm">
                {isSidebarOpen ? <FiX /> : <FiMenu />}
            </button>

            <aside
                className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-white/95 transition-transform duration-200 ease-in-out md:static md:translate-x-0`}
            >
                <div className="flex h-full flex-col p-5">
                    <div className="mb-8 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-dark))] text-white shadow-[0_18px_40px_rgba(13,148,136,0.22)]">
                            <FiUser className="text-lg" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Patient hub</p>
                            <p className="text-sm text-slate-500">Your care history and next steps</p>
                        </div>
                    </div>

                    {profile && (
                        <div className="mb-8 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                            <div className="flex items-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-800">
                                    <span className="font-semibold">{profile.username ? profile.username.charAt(0).toUpperCase() : "U"}</span>
                                </div>
                                <div className="ml-3">
                                    <p className="font-medium text-slate-800">{profile.username || "User"}</p>
                                    <p className="text-sm text-slate-500">{profile.email || ""}</p>
                                </div>
                            </div>
                            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
                                <div className="rounded-2xl bg-white p-3">
                                    <p className="font-semibold text-slate-900">Appointments</p>
                                    <p className="mt-1">Track visits and follow-up plans</p>
                                </div>
                                <div className="rounded-2xl bg-white p-3">
                                    <p className="font-semibold text-slate-900">Orders</p>
                                    <p className="mt-1">Check pharmacy and delivery status</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <nav className="flex-1">
                        <ul className="space-y-2">
                            {menuItems.map((item) => (
                                <li key={item.label}>
                                    <button
                                        onClick={() => handleNavigation(item.path)}
                                        className={`w-full rounded-2xl p-3 text-left transition ${isActive(item.path) ? "bg-teal-50 text-teal-800" : "text-slate-700 hover:bg-slate-50"
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

                    <div className="mt-auto rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                        Account visibility, status tracking, and communication are now grouped into one calmer workspace.
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-auto">
                <div className="p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardModern;
