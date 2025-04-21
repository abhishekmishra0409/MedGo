import { Link } from "react-router-dom";

const HeroSection = () => {
    return (
        <div className="relative w-full h-[450px] sm:h-[500px] md:h-[550px] lg:h-[600px] px-2 lg:px-28">
            {/* Background Images */}
            {/* Mobile Image */}
            <div className="md:hidden absolute inset-0 w-full h-full">
                <img
                    src="/doctor_bg_img.jpg"
                    alt="Mobile hero background"
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>

            {/* Desktop Image */}
            <div className="hidden md:block absolute inset-0 w-full h-full">
                <img
                    src="/Home_bg.png"
                    alt="Desktop hero background"
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
            </div>

            {/* Gradient Overlay - Responsive Opacity */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30
                          lg:from-black/5 lg:to-black/20
                          md:from-black/10 md:to-black/25
                          sm:from-black/15 sm:to-black/30"></div>

            {/* Content Container */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-10">
                <div className="max-w-2xl">
                    {/* Main Heading */}
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-50 leading-tight mb-4">
                        We Provide{' '}
                        <span className="bg-gradient-to-r from-teal-300 to-teal-700 bg-clip-text text-transparent">
                            Medical
                        </span>{' '}
                        Services <br className="hidden lg:block" />
                        That You Can{' '}
                        <span className="bg-gradient-to-r from-teal-300 to-teal-700 bg-clip-text text-transparent">
                            Trust!
                        </span>
                    </h1>

                    {/* Subtitle - Responsive text sizing */}
                    <p className="text-gray-700 text-sm xs:text-base sm:text-lg md:text-xl mb-4 sm:mb-6">
                        Reliable healthcare at your fingertips or connect with trusted doctors,
                        book appointments, and access medical services effortlessly.
                    </p>

                    {/* CTA Button */}
                    <div className="w-full sm:w-3/4 md:w-1/2 lg:w-1/3">
                        <Link to={"/doctorlists"}>
                            <button
                                className="mt-3 sm:mt-4 px-4 py-2 md:px-5 md:py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow-md transition-all text-xs sm:text-sm md:text-base font-medium">
                                Get Appointment
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;