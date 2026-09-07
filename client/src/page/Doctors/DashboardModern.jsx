import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FiBook, FiBriefcase, FiCalendar, FiClock, FiHome, FiLogOut, FiMenu, FiUser, FiUsers, FiX } from "react-icons/fi";
import { PiFlask } from "react-icons/pi";
import { MdOutlineMessage } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { logoutDoctor } from "../../features/Doctor/DoctorSlice.js";
import { fetchMyClinic } from "../../features/Clinic/ClinicSlice.js";
import NotificationBell from "../../component/Notifications/NotificationBell.jsx";

const baseMenuItems = [
    { icon: <FiUser className="text-lg" />, label: "Profile", path: "" },
    { icon: <FiBriefcase className="text-lg" />, label: "Professional Details", path: "professional-details" },
    { icon: <FiHome className="text-lg" />, label: "Clinic", path: "clinic" },
    // Gated by doctorMiddleware server-side (403 while approvalStatus !== 'approved') —
    // disabled here rather than left to fail with an error toast.
    { icon: <FiBook className="text-lg" />, label: "Blogs", path: "blogs", requiresApproval: true },
    { icon: <FiCalendar className="text-lg" />, label: "Appointments", path: "appointments", requiresApproval: true },
    { icon: <FiClock className="text-lg" />, label: "Availability", path: "availability" },
    { icon: <PiFlask className="text-lg" />, label: "LabTest", path: "labtest", requiresApproval: true },
    { icon: <MdOutlineMessage className="text-lg" />, label: "Messages", path: "messages", requiresApproval: true },
    { icon: <FiLogOut className="text-lg" />, label: "Logout", path: "/logout" },
];

const DashboardModern = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { profile } = useSelector((state) => state.doctor);
    const canManageClinic = useSelector((state) => Boolean(state.clinic.myClinic?.canManage));
    const isApproved = profile?.approvalStatus === "approved";

    const menuItems = canManageClinic
        ? [
            ...baseMenuItems.slice(0, 3),
            { icon: <FiUsers className="text-lg" />, label: "Doctor Roster", path: "roster" },
            ...baseMenuItems.slice(3),
        ]
        : baseMenuItems;

    // Fetched eagerly (not just from the Clinic tab) so the Roster menu item
    // appears immediately for doctor-owners without a detour through Clinic first.
    useEffect(() => {
        dispatch(fetchMyClinic());
    }, [dispatch]);

    const handleNavigation = (path, requiresApproval) => {
        if (path === "/logout") {
            dispatch(logoutDoctor())
                .unwrap()
                .then(() => navigate("/login"));
            return;
        }

        if (requiresApproval && !isApproved) {
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
        <div className="relative flex min-h-dvh w-full bg-[linear-gradient(180deg,#f7fbff_0%,#f4f8fb_100%)]">
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
                className={`${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-40 w-[min(17rem,85vw)] transform border-r border-slate-200 bg-white/95 transition-transform duration-200 ease-in-out md:translate-x-0`}
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
                            {menuItems.map((item) => {
                                const isLocked = item.requiresApproval && !isApproved;

                                return (
                                    <li key={item.label}>
                                        <button
                                            type="button"
                                            onClick={() => handleNavigation(item.path, item.requiresApproval)}
                                            disabled={isLocked}
                                            title={isLocked ? "Unlocks once your account is approved" : undefined}
                                            className={`w-full rounded-2xl px-3 py-2.5 text-left transition ${
                                                isLocked
                                                    ? "cursor-not-allowed text-slate-300"
                                                    : isActive(item.path)
                                                        ? "bg-teal-50 text-teal-800"
                                                        : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                        >
                                            <span className="flex items-center gap-3">
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </nav>
                </div>
            </aside>

            <main className="min-w-0 flex-1 md:ml-[min(17rem,85vw)]">
                <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-end border-b border-slate-200 bg-white/90 px-4 backdrop-blur-sm md:left-[min(17rem,85vw)] md:px-6 xl:px-8">
                    <NotificationBell tokenKey="doctorToken" />
                </header>

                <div className="w-full p-4 pt-20 md:p-6 md:pt-[5.5rem] xl:p-8 xl:pt-24">
                    {profile?.approvalStatus === "rejected" ? (
                        <div className="auth-alert auth-alert--error mb-4">
                            Your doctor application was rejected{profile.approvalNotes ? `: ${profile.approvalNotes}` : "."} Contact support if you believe this is a mistake.
                        </div>
                    ) : profile?.approvalStatus === "pending" ? (
                        <div className="auth-alert auth-alert--info mb-4">
                            Your credentials are being verified. You can complete your profile now; appointments, blogs, lab bookings, and messages unlock after approval.
                        </div>
                    ) : null}
                    {profile?.approvalStatus === "approved" && profile?.clinicMembershipStatus === "pending" ? (
                        <div className="auth-alert auth-alert--info mb-4">
                            Waiting for your clinic to confirm you on their roster before you appear in patient search.
                        </div>
                    ) : null}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardModern;
