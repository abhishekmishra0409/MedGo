import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaShoppingCart, FaUser } from "react-icons/fa";
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
    const isLoggedIn = user || doctor;

    // Logout Function
    const handleLogout = () => {
        if (user) {
            dispatch(logoutUser());
        } else if (doctor) {
            dispatch(logoutDoctor());
        }
        navigate("/login");
    };

    return (
        <nav className="bg-teal-300 flex items-center justify-between px-10 py-4">
            {/* Logo */}
            <div>
                <Link to="/">
                    <img src="/Logo.png" alt="Sunrise Logo" className="h-16"/>
                </Link>
            </div>

            {/* Search Bar */}
            <div className="flex-grow max-w-xl">
                <div className="flex items-center bg-white px-4 py-2 rounded-lg shadow-md">
                    <FaSearch className="text-gray-600"/>
                    <input
                        type="text"
                        placeholder="Search Medicines"
                        className="ml-2 outline-none w-full bg-transparent text-gray-700"
                    />
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex gap-8 text-white text-sm font-medium">
                <Link to="/doctors" className="flex items-center gap-1 cursor-pointer">
                    <IoMdMedical className="text-blue-400 text-xl"/>
                    <span>Doctors</span>
                </Link>
                <Link to="/store" className="flex items-center gap-1 cursor-pointer">
                    <MdLocalHospital className="text-pink-400 text-xl"/>
                    <span>Store</span>
                </Link>
                <Link to="/ambulance" className="flex items-center gap-1 cursor-pointer">
                    <GiAmbulance className="text-red-500 text-xl"/>
                    <span>Ambulance</span>
                </Link>
                <Link to="/blogs" className="flex items-center gap-1 cursor-pointer">
                    <FaMicroblog className="text-blue-500 text-xl"/>
                    <span>Blogs</span>
                </Link>
                <Link to="/labtest" className="flex items-center gap-1 cursor-pointer">
                    <MdLocalPharmacy className="text-blue-500 text-xl"/>
                    <span>LabTest</span>
                </Link>
            </div>

            {/* Icons & Profile/Login */}
            <div className="flex gap-6 items-center">
                {/* Cart Icon - Only show for users */}
                {user && (
                    <Link to={'/cart'}>
                        <div className="relative cursor-pointer">
                            <FaShoppingCart className="text-gray-700 text-xl"/>
                        </div>
                    </Link>
                )}

                {/* Show Profile Button if Logged In, Else Show Login Button */}
                {isLoggedIn ? (
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-2 border border-gray-500 px-4 py-1 rounded-lg bg-teal-400 hover:bg-teal-500"
                        >
                            <FaUser className="text-gray-700"/>
                            <span>Profile</span>
                        </button>

                        {/* Dropdown Menu - Different for user and doctor */}
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
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
                    <Link to="/login" className="flex items-center gap-2 border border-gray-500 px-4 py-1 rounded-lg bg-teal-400 hover:bg-teal-500">
                        <FaUser className="text-gray-700"/>
                        <span>Login</span>
                    </Link>
                )}
            </div>

            {/* Doctor Illustration */}
            <div className="hidden lg:block">
                <img src="/Mask%20group.png" alt="Doctor" className="h-24"/>
            </div>
        </nav>
    );
};

export default Navbar;