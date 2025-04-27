import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes } from "react-icons/fa";
import { IoMdMedical } from "react-icons/io";
import { GiAmbulance } from "react-icons/gi";
import { FaMicroblog } from "react-icons/fa";
import { MdLocalHospital, MdLocalPharmacy } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../features/User/UserSlice";
import { logoutDoctor } from "../features/Doctor/DoctorSlice";

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { doctor } = useSelector((state) => state.doctor);
    const [showDropdown, setShowDropdown] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const isLoggedIn = user || doctor;

    const handleLogout = () => {
        if (user) {
            dispatch(logoutUser());
        } else if (doctor) {
            dispatch(logoutDoctor());
        }
        navigate("/login");
    };

    return (
        <nav className="bg-teal-300 px-4 py-3 md:px-6 lg:px-8 flex flex-wrap items-center justify-between relative">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center justify-between w-full md:w-auto">
                <Link to="/" className="flex items-center">
                    <img src="./Logo.png" alt="Logo" className="h-12 lg:h-14" />
                </Link>

                <div className="flex items-center gap-4 md:hidden">
                    {user && (
                        <Link to="/cart" className="text-gray-700">
                            <FaShoppingCart className="text-xl" />
                        </Link>
                    )}

                    {/* Login Button - Mobile Only */}
                    {!isLoggedIn && (
                        <Link to="/login" className="text-gray-700">
                            <FaUser className="text-xl" />
                        </Link>
                    )}

                    {/* Profile Dropdown - Mobile Only */}
                    {isLoggedIn && (
                        <button onClick={() => setShowDropdown(!showDropdown)} className="text-gray-700">
                            <FaUser className="text-xl" />
                        </button>
                    )}

                    <button
                        className="text-gray-700 text-2xl focus:outline-none"
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        {menuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:block w-full md:w-auto md:flex-grow max-w-xl md:ml-4 lg:ml-6">
                <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-md">
                    <FaSearch className="text-gray-600" />
                    <input
                        type="text"
                        placeholder="Search Medicines"
                        className="ml-2 outline-none w-full bg-transparent text-gray-700"
                    />
                </div>
            </div>

            {/* Desktop Nav Links - UNCHANGED */}
            <div className="hidden md:flex gap-4 lg:gap-6 text-white text-sm font-medium ml-4">
                <Link to="/doctors" className="flex items-center gap-1 hover:text-teal-100 transition">
                    <IoMdMedical className="text-blue-400 text-xl" />
                    <span>Doctors</span>
                </Link>
                <Link to="/store" className="flex items-center gap-1 hover:text-teal-100 transition">
                    <MdLocalHospital className="text-pink-400 text-xl" />
                    <span>Store</span>
                </Link>
                <Link to="/ambulance" className="flex items-center gap-1 hover:text-teal-100 transition">
                    <GiAmbulance className="text-red-500 text-xl" />
                    <span>Ambulance</span>
                </Link>
                <Link to="/blogs" className="flex items-center gap-1 hover:text-teal-100 transition">
                    <FaMicroblog className="text-blue-500 text-xl" />
                    <span>Blogs</span>
                </Link>
                <Link to="/labtest" className="flex items-center gap-1 hover:text-teal-100 transition">
                    <MdLocalPharmacy className="text-blue-500 text-xl" />
                    <span>LabTest</span>
                </Link>
            </div>

            {/* Right Icons - Desktop - UNCHANGED */}
            <div className="hidden md:flex items-center gap-4">
                {user && (
                    <Link to="/cart" className="text-gray-700 hover:text-gray-900">
                        <FaShoppingCart className="text-xl" />
                    </Link>
                )}

                {isLoggedIn ? (
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-2 border border-gray-500 px-3 py-1 rounded-lg bg-teal-400 hover:bg-teal-500 transition"
                        >
                            <FaUser className="text-gray-700" />
                            <span>Profile</span>
                        </button>
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                                {user ? (
                                    <>
                                        <Link to="/user" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
                                        <Link to="/user/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Orders</Link>
                                        <Link to="/user/appointments" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Appointments</Link>
                                        <Link to="/user/labtest" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">LabTest</Link>
                                    </>
                                ) : doctor ? (
                                    <>
                                        <Link to="/doctor" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
                                        <Link to="/doctor/appointments" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Appointments</Link>
                                        <Link to="/doctor/blogs" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Blogs</Link>
                                    </>
                                ) : null}
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 border-t border-gray-200"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link to="/login" className="flex items-center gap-2 border border-gray-500 px-3 py-1 rounded-lg bg-teal-400 hover:bg-teal-500 transition">
                        <FaUser className="text-gray-700" />
                        <span>Login</span>
                    </Link>
                )}
            </div>

            {/* Doctor Illustration - Desktop - UNCHANGED */}
            <div className="hidden lg:block">
                <img src="/Mask%20group.png" alt="Doctor" className="h-20 lg:h-24" />
            </div>

            {/* Mobile Menu - Full screen overlay */}
            {menuOpen && (
                <div className="fixed inset-0 bg-teal-400 z-40 pt-16 px-4 md:hidden">
                    <div className="flex flex-col gap-6 text-lg text-white">
                        <Link
                            to="/doctors"
                            className="flex items-center gap-3 py-3 border-b border-teal-500"
                            onClick={() => setMenuOpen(false)}
                        >
                            <IoMdMedical className="text-blue-400 text-2xl" /> Doctors
                        </Link>
                        <Link
                            to="/store"
                            className="flex items-center gap-3 py-3 border-b border-teal-500"
                            onClick={() => setMenuOpen(false)}
                        >
                            <MdLocalHospital className="text-pink-400 text-2xl" /> Store
                        </Link>
                        <Link
                            to="/ambulance"
                            className="flex items-center gap-3 py-3 border-b border-teal-500"
                            onClick={() => setMenuOpen(false)}
                        >
                            <GiAmbulance className="text-red-500 text-2xl" /> Ambulance
                        </Link>
                        <Link
                            to="/blogs"
                            className="flex items-center gap-3 py-3 border-b border-teal-500"
                            onClick={() => setMenuOpen(false)}
                        >
                            <FaMicroblog className="text-blue-500 text-2xl" /> Blogs
                        </Link>
                        <Link
                            to="/labtest"
                            className="flex items-center gap-3 py-3 border-b border-teal-500"
                            onClick={() => setMenuOpen(false)}
                        >
                            <MdLocalPharmacy className="text-blue-500 text-2xl" /> LabTest
                        </Link>

                        <div className="mt-8">
                            {isLoggedIn ? (
                                <>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full py-3 px-4 bg-red-500 text-white rounded-lg text-center"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <Link
                                    to="/login"
                                    className="block py-3 px-4 bg-teal-600 text-white rounded-lg text-center"
                                    onClick={() => setMenuOpen(false)}
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Dropdown - Mobile */}
            {showDropdown && (
                <div className="fixed inset-0 z-30 md:hidden" onClick={() => setShowDropdown(false)}>
                    <div className="absolute right-4 top-16 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                        {user ? (
                            <>
                                <Link to="/user" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
                                <Link to="/user/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Orders</Link>
                                <Link to="/user/appointments" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Appointments</Link>
                                <Link to="/user/labtest" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">LabTest</Link>
                            </>
                        ) : doctor ? (
                            <>
                                <Link to="/doctor" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Profile</Link>
                                <Link to="/doctor/appointments" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Appointments</Link>
                                <Link to="/doctor/blogs" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">Blogs</Link>
                            </>
                        ) : null}
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 border-t border-gray-200"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;