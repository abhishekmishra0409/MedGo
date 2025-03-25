import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-gradient-to-t from-teal-300 to-white text-gray-800 pt-10 pb-6 px-28">
            <div className="container mx-auto px-6">

                {/* Top Section */}
                <div className="flex flex-wrap justify-between items-center text-center md:text-left">
                    <div className="mb-6 md:mb-0">
                        <img src="/logo.png" alt="Sunrise Logo" className="h-16 mx-auto md:mx-0" />
                    </div>

                </div>

                {/* Middle Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10 text-sm">

                    <div>
                        <h3 className="font-semibold">COMPANY</h3>
                        <ul className="mt-3 space-y-2">
                            <li>About Us</li>
                            <li>Customers Speak</li>
                            <li>In the News</li>
                            <li>Contact</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold">OUR POLICIES</h3>
                        <ul className="mt-3 space-y-2">
                            <li>Terms & Conditions</li>
                            <li>Privacy Policy</li>
                            <li>Fees & Payments</li>
                            <li>Shipping & Delivery</li>
                            <li>Return & Refund Policy</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold">POPULAR CATEGORIES</h3>
                        <ul className="mt-3 space-y-2">
                            <li>Fitness</li>
                            <li>Devices</li>
                            <li>Personal Care</li>
                            <li>Ayurveda</li>
                            <li>Homeopathy</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold">SUBSCRIBE</h3>
                        <p className="mt-3">Get the latest offers and health tips</p>
                        <div className="flex items-center mt-3 border border-gray-300 rounded-md overflow-hidden">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="p-2 flex-grow outline-none"
                            />
                            <button className="bg-teal-600 text-white px-4 py-2">→</button>
                        </div>
                    </div>

                </div>

                {/* Bottom Section */}
                <div className="mt-10 border-t border-gray-300 pt-4 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm">&copy; 2025 DawaiLink. All Rights Reserved.</p>

                    <div className="flex space-x-3 mt-3">
                        <FaFacebook className="text-xl cursor-pointer"/>
                        <FaTwitter className="text-xl cursor-pointer"/>
                        <FaLinkedin className="text-xl cursor-pointer"/>
                        <FaYoutube className="text-xl cursor-pointer"/>
                        <FaInstagram className="text-xl cursor-pointer"/>
                    </div>

                    <div className="flex space-x-4 mt-3 md:mt-0">
                        <img src="./play_store.png" alt="Google Play" className="h-10"/>
                        <img src="./app_store.png" alt="App Store" className="h-10"/>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
