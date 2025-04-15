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
        <div className="flex flex-col h-full p-4 bg-white border-r border-gray-200 w-64">
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
                    className="flex items-center w-full gap-2 p-3 rounded-lg transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;