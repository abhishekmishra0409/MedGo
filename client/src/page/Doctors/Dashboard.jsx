import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FiUser, FiBook, FiCalendar, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { logoutDoctor } from '../../features/Doctor/DoctorSlice.js';
import { toast } from 'react-toastify';
import {PiFlask} from "react-icons/pi";
import { MdOutlineMessage } from "react-icons/md";


const DoctorsMainLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { doctor, isAuthenticated } = useSelector((state) => state.doctor);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const menuItems = [
        { icon: <FiUser className="text-lg" />, label: 'Profile', path: '' },
        { icon: <FiBook className="text-lg" />, label: 'Blogs', path: 'blogs' },
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
            dispatch(logoutDoctor())
                .unwrap()
                .then(() => {
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
            return location.pathname === '/doctor' || location.pathname === '/doctor/';
        }
        return location.pathname.includes(`/doctor/${path}`);
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
                    {doctor && (
                        <div className="flex items-center mb-8 p-4 rounded-lg bg-indigo-50">
                            <div className="w-12 h-9 rounded-full bg-indigo-200 flex items-center justify-center">
                                <span className="text-indigo-600 font-semibold">
                                    {doctor.name ? doctor.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                            </div>
                            <div className="ml-3">
                                <p className="font-medium text-gray-800">{doctor.name || 'Doctors'}</p>
                                <p className="text-sm text-gray-500">{doctor?.email || ''}</p>
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
                                            ? 'bg-indigo-100 text-indigo-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
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

export default DoctorsMainLayout;