import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { routes } from "../routes";
import NavItem from "./NavItem";
import { LogOut, LayoutDashboard } from "lucide-react";
import { logoutUser } from '../features/auth/authSlice';
import toast from 'react-hot-toast';

const Sidebar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const mainRoutes = routes.find((route) => route.path === "/");

    // Add overview item to the beginning
    const sidebarItems = [
        {
            path: "/overview",
            name: "Overview",
            icon: LayoutDashboard
        },
        ...(mainRoutes?.children || [])
    ];

    const handleLogout = () => {
        dispatch(logoutUser())
            .unwrap()
            .then(() => {
                navigate('/login');
                toast.success('Logged out successfully');
            })
            .catch((error) => {
                toast.error(error.message || 'Logout failed');
            });
    };

    return (
        <div className="flex h-full w-64 flex-col rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-5 rounded-3xl bg-[linear-gradient(135deg,#0f9c8c,#0b7669)] p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-100">Admin Hub</p>
                <h2 className="mt-2 text-lg font-semibold">MedGo operations</h2>
                <p className="mt-2 text-xs leading-5 text-teal-50">Products, doctors, clinics, diagnostics, and orders.</p>
            </div>
            <div className="min-h-0 flex-1">
                <div className="space-y-1.5">
                    {sidebarItems.map((item) => (
                        <NavItem key={item.path} item={item} />
                    ))}
                </div>
            </div>
            <div className="mt-3 border-t border-slate-200 pt-2">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-slate-700 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
