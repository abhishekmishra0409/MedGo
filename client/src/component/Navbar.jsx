import { FaSearch, FaShoppingCart, FaUser } from "react-icons/fa";
import { MdLocalPharmacy, MdLocalHospital, MdOutlineLocalOffer } from "react-icons/md";
import { IoMdMedical } from "react-icons/io";
import { GiAmbulance } from "react-icons/gi";
import { Link } from "react-router-dom";

const Navbar = () => {
    return (
        <nav className="bg-teal-300 flex items-center justify-between px-10 py-4">
            {/* Logo */}
            <div className="mb-6 md:mb-0">
                <Link to="/"> {/* Wrap logo with Link to navigate to Home */}
                    <img src="/logo.png" alt="Sunrise Logo" className="h-16 mx-auto md:mx-0"/>
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

            {/* Navigation Items */}
            <div className="flex gap-8 text-white text-sm font-medium">
                <Link to="/pharmacy" className="flex items-center gap-1 cursor-pointer"> {/* Pharmacy Link */}
                    <MdLocalPharmacy className="text-blue-500 text-xl"/>
                    <span>Pharmacy</span>
                </Link>
                <Link to="/doctors" className="flex items-center gap-1 cursor-pointer"> {/* Doctors Link */}
                    <IoMdMedical className="text-blue-400 text-xl"/>
                    <span>Doctors</span>
                </Link>
                <Link to="/store" className="flex items-center gap-1 cursor-pointer"> {/* Store Link */}
                    <MdLocalHospital className="text-pink-400 text-xl"/>
                    <span>Store</span>
                </Link>
                <Link to="/ambulance" className="flex items-center gap-1 cursor-pointer"> {/* Ambulance Link */}
                    <GiAmbulance className="text-red-500 text-xl"/>
                    <span>Ambulance</span>
                </Link>
            </div>

            {/* Icons */}
            <div className="flex gap-6 items-center">
                <div className="relative cursor-pointer">
                    <FaShoppingCart className="text-gray-700 text-xl"/>
                </div>

                <Link to="/login-option" className="flex items-center gap-2 border border-gray-500 px-4 py-1 rounded-lg hover:bg-teal-600"> {/* Login Link */}
                    <FaUser className="text-gray-700"/>
                    <span>Login</span>
                </Link>
            </div>

            {/* Doctor Illustration */}
            <div className="hidden lg:block">
                <img src="/Mask%20group.png" alt="Doctor" className="h-24"/>
            </div>
        </nav>
    );
};

export default Navbar;