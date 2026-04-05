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
        <div className="flex h-full w-72 flex-col rounded-[32px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6 rounded-[24px] bg-[linear-gradient(135deg,#0f9c8c,#0b7669)] p-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-100">Admin Hub</p>
                <h2 className="mt-2 text-xl font-semibold">Operational view for MedGo</h2>
                <p className="mt-2 text-sm text-teal-50">Manage products, doctors, orders, clinics, and diagnostics from one calmer dashboard.</p>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-2">
                    {sidebarItems.map((item) => (
                        <NavItem key={item.path} item={item} />
                    ))}
                </div>
            </div>
            <div className="pt-2 mt-auto border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full gap-2 rounded-2xl p-3 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
