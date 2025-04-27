import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-gradient-to-t from-teal-300 to-white text-gray-800 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto">

                {/* Top Section - Centered on mobile */}
                <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:items-center md:text-left">
                    <div className="mb-6 md:mb-0">
                        <img src="./Logo.png" alt="Logo" className="h-14 md:h-16 mx-auto md:mx-0" />
                    </div>
                </div>

                {/* Middle Section - Stacked on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8 text-sm">

                    <div className="text-center sm:text-left">
                        <h3 className="font-semibold text-base">COMPANY</h3>
                        <ul className="mt-2 space-y-1">
                            <li className="hover:text-teal-600 cursor-pointer">About Us</li>
                            <li className="hover:text-teal-600 cursor-pointer">Customers Speak</li>
                            <li className="hover:text-teal-600 cursor-pointer">In the News</li>
                            <li className="hover:text-teal-600 cursor-pointer">Contact</li>
                        </ul>
                    </div>

                    <div className="text-center sm:text-left">
                        <h3 className="font-semibold text-base">OUR POLICIES</h3>
                        <ul className="mt-2 space-y-1">
                            <li className="hover:text-teal-600 cursor-pointer">Terms & Conditions</li>
                            <li className="hover:text-teal-600 cursor-pointer">Privacy Policy</li>
                            <li className="hover:text-teal-600 cursor-pointer">Fees & Payments</li>
                            <li className="hover:text-teal-600 cursor-pointer">Shipping & Delivery</li>
                            <li className="hover:text-teal-600 cursor-pointer">Return & Refund Policy</li>
                        </ul>
                    </div>

                    <div className="text-center sm:text-left">
                        <h3 className="font-semibold text-base">POPULAR CATEGORIES</h3>
                        <ul className="mt-2 space-y-1">
                            <li className="hover:text-teal-600 cursor-pointer">Fitness</li>
                            <li className="hover:text-teal-600 cursor-pointer">Devices</li>
                            <li className="hover:text-teal-600 cursor-pointer">Personal Care</li>
                            <li className="hover:text-teal-600 cursor-pointer">Ayurveda</li>
                            <li className="hover:text-teal-600 cursor-pointer">Homeopathy</li>
                        </ul>
                    </div>

                    <div className="text-center sm:text-left">
                        <h3 className="font-semibold text-base">SUBSCRIBE</h3>
                        <p className="mt-2 text-sm">Get the latest offers and health tips</p>
                        <div className="flex items-center mt-2 border border-gray-300 rounded-md overflow-hidden max-w-xs mx-auto sm:mx-0">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="p-2 flex-grow outline-none text-sm"
                            />
                            <button className="bg-teal-600 text-white px-3 py-2 hover:bg-teal-700 transition">→</button>
                        </div>
                    </div>

                </div>

                {/* Bottom Section - Stacked on mobile */}
                <div className="mt-8 border-t border-gray-300 pt-4 flex flex-col items-center md:flex-row md:justify-between">
                    <p className="text-xs md:text-sm text-center md:text-left mb-4 md:mb-0">
                        &copy; 2025 DawaiLink. All Rights Reserved.
                    </p>

                    <div className="flex space-x-4 mb-4 md:mb-0">
                        <FaFacebook className="text-lg md:text-xl cursor-pointer hover:text-teal-600"/>
                        <FaTwitter className="text-lg md:text-xl cursor-pointer hover:text-teal-600"/>
                        <FaLinkedin className="text-lg md:text-xl cursor-pointer hover:text-teal-600"/>
                        <FaYoutube className="text-lg md:text-xl cursor-pointer hover:text-teal-600"/>
                        <FaInstagram className="text-lg md:text-xl cursor-pointer hover:text-teal-600"/>
                    </div>

                    <div className="flex space-x-3">
                        <img src="./play_store.png" alt="Google Play" className="h-8 md:h-10"/>
                        <img src="./app_store.png" alt="App Store" className="h-8 md:h-10"/>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;