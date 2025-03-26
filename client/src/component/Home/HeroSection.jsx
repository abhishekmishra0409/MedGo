import {Link} from "react-router-dom";

const HeroSection = () => {
    return (
        <div className="relative w-full h-[600px] bg-cover bg-center flex items-center"
             style={{ backgroundImage: "url('/Home_bg.png')" }}>
            {/* Content */}
            <div className="container px-8 flex flex-col justify-start text-left max-w-2xl mx-28">
                <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                    We Provide <span className="bg-gradient-to-r from-teal-300 to-teal-700 bg-clip-text text-transparent text-gray-800">Medical</span> Services <br/>
                    That You Can <span className="bg-gradient-to-r from-teal-300 to-teal-700 bg-clip-text text-transparent text-gray-800">Trust!</span>
                </h1>
                <p className="text-gray-700 mt-4">
                Reliable healthcare at your fingertips or connect with trusted doctors, book appointments, and access medical services effortlessly.
                </p>
                <Link to={"/doctorlists"}>
                <button className="mt-6 px-6 py-3 bg-gradient-to-r from-teal-300 to-teal-700 text-white font-semibold rounded-lg shadow-md hover:bg-teal-600 transition w-1/3 cursor-pointer">
                    Get Appointment
                </button>
                </Link>
            </div>

        </div>
    );
};

export default HeroSection;
