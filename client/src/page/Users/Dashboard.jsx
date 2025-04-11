import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FiUser, FiShoppingBag, FiCalendar, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { PiFlask } from "react-icons/pi";
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../features/User/UserSlice.js';
import { toast } from 'react-toastify';
import {MdOutlineMessage} from "react-icons/md";

const MainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    // console.log(user)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const menuItems = [
        { icon: <FiUser className="text-lg" />, label: 'Profile', path: '' },
        { icon: <FiShoppingBag className="text-lg" />, label: 'Orders', path: 'orders' },
        { icon: <FiCalendar className="text-lg" />, label: 'Appointments', path: 'appointments' },
        { icon: <PiFlask className="text-lg" />, label: 'LabTest', path: 'labtest' },
        { icon: <MdOutlineMessage className="text-lg" />, label: 'Messages', path: 'messages' },
        { icon: <FiLogOut className="text-lg" />, label: 'Logout', path: '/logout' },
    ];

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleNavigation = (path) => {
        if (path === '/logout') {
            dispatch(logoutUser())
                .unwrap()
                .then(() => {
                    // toast.success('Logged out successfully');
                    navigate('/login');
                })
                .catch((error) => {
                    toast.error(error.message || 'Logout failed');
                });
        } else {
            navigate(path);
        }
    };

    // Helper function to check if a menu item is active
    const isActive = (path) => {
        if (path === '') {
            return location.pathname === '/user' || location.pathname === '/user/';
        }
        return location.pathname.includes(`/user/${path}`);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Mobile Sidebar Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
            >
                {isSidebarOpen ? <FiX /> : <FiMenu />}
            </button>

            {/* Sidebar */}
            <div
                className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transform transition-transform duration-200 ease-in-out
        fixed md:static inset-y-0 left-0 w-64 bg-white shadow-lg z-40`}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Logo/Brand */}
                    <div className="flex items-center justify-center h-16 mb-8">
                        <h1 className="text-xl font-bold text-indigo-600">Dashboard</h1>
                    </div>

                    {/* User Profile Summary */}
                    {user && (
                        <div className="flex items-center mb-8 p-4 rounded-lg bg-indigo-50">
                            <div className="w-12 h-12 rounded-full bg-indigo-200 flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">
                  {user.data?.username ? user.data?.username.charAt(0).toUpperCase() : 'U'}
                </span>
                            </div>
                            <div className="ml-3">
                                <p className="font-medium text-gray-800">{user.data?.username || 'User'}</p>
                                <p className="text-sm text-gray-500">{user.data?.email || ''}</p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Menu */}
                    <nav className="flex-1">
                        <ul className="space-y-2">
                            {menuItems.map((item, index) => (
                                <li key={index}>
                                    <button
                                        onClick={() => handleNavigation(item.path)}
                                        className={`w-full flex items-center p-3 rounded-lg transition-colors
                                            ${isActive(item.path)
                                            ? 'bg-indigo-100 text-indigo-700'
                                            : 'hover:bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        <span className="mr-3">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Footer/Copyright */}
                    <div className="mt-auto py-4 text-center text-sm text-gray-500">
                        © 2025 DawaiLink
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default MainLayout;