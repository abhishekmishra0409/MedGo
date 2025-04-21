import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllTests } from "../features/Labtest/LabtestSlice.js";
import { CheckCircle, Users, ShieldCheck, MapPin, FlaskConical, Home } from "lucide-react";
import LabCard from "../component/Common/LabCard.jsx";
import { Link } from "react-router-dom";

const LabTest = () => {
    const dispatch = useDispatch();
    const { tests, isLoading, isError, message } = useSelector((state) => state.labTest);

    useEffect(() => {
        dispatch(fetchAllTests());
    }, [dispatch]);

    return (
        <div className="overflow-x-hidden">
            {/* ✅ Hero Section - Made responsive */}
            <div
                className="relative w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] bg-cover bg-center flex items-center justify-start px-4 sm:px-8 md:px-16 lg:px-28"
                style={{ backgroundImage: "url('/LabTest/LabTestMain.png')" }}
            >
                <div className="text-left max-w-md p-4 rounded-lg">
                    <p className="text-gray-600 text-xs sm:text-sm">Book Now!</p>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black drop-shadow-md">
                        Check Our Lab Tests
                    </h1>
                    <Link to={"/labtestlists"}>
                        <button className="mt-2 sm:mt-4 px-4 py-1 sm:px-6 sm:py-2 bg-teal-500 text-white rounded-lg shadow-md hover:bg-teal-600 transition-all text-sm sm:text-base">
                            Book Tests
                        </button>
                    </Link>
                </div>
            </div>

            <FeatureSection />

            {/* ✅ Lab Test Cards - Made responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 px-4 sm:px-8 md:px-16 lg:px-28 my-8 sm:my-12 md:my-16">
                {isLoading ? (
                    [...Array(6)].map((_, index) => (
                        <div
                            key={index}
                            className="w-full h-[180px] sm:h-[200px] p-4 border rounded-lg shadow-lg bg-white animate-pulse"
                        ></div>
                    ))
                ) : isError ? (
                    <div className="text-center w-full py-8 col-span-full">
                        <p className="text-red-500">{message || "Something went wrong!"}</p>
                    </div>
                ) : (
                    tests.slice(0, 6).map((test) => (
                        <div key={test._id} className="flex justify-center">
                            <LabCard test={test} />
                        </div>
                    ))
                )}
            </div>

            <HealthRiskSection />
            <HealthConditionSection />
        </div>
    );
};

const features = [
    { icon: <CheckCircle className="text-teal-600" />, title: "Most Trusted by", subtitle: "Doctors" },
    { icon: <Users className="text-teal-600" />, title: "Over 1 Crore", subtitle: "satisfied customers" },
    { icon: <FlaskConical className="text-teal-600" />, title: "NABL approved", subtitle: "Labs" },
    { icon: <ShieldCheck className="text-teal-600" />, title: "3000+ Exclusive", subtitle: "Collection Centers" },
    { icon: <Home className="text-teal-600" />, title: "Home Collection", subtitle: "Qualified Technicians" },
    { icon: <MapPin className="text-teal-600" />, title: "PAN India", subtitle: "Footprint" },
];

const FeatureSection = () => {
    return (
        <div className="bg-white py-4 sm:py-6 md:py-8 w-full overflow-hidden">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Horizontal scroll on mobile, grid on larger screens */}
                <div className="flex snap-x snap-mandatory sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 overflow-x-auto pb-4 sm:pb-0 hide-scrollbar">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="snap-start flex-shrink-0 w-[45vw] xs:w-[40vw] sm:w-full flex flex-col items-center text-center p-3 border border-gray-100 rounded-xl shadow-xs bg-white hover:shadow-sm transition-shadow"
                        >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-teal-600">
                                {React.cloneElement(feature.icon, {
                                    size: window.innerWidth < 640 ? 28 : 32,
                                    className: "text-teal-600"
                                })}
                            </div>
                            <h3 className="font-semibold text-xs xs:text-sm sm:text-base mt-2 text-gray-800">
                                {feature.title}
                            </h3>
                            <p className="text-[10px] xs:text-xs text-gray-500 mt-1">
                                {feature.subtitle}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom scrollbar hiding */}
            <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .shadow-xs {
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
      `}</style>
        </div>
    );
};

// Health Risks Section
const healthRisks = [
    { name: "Heart", image: "/LabTest/Labheart.png" },
    { name: "Liver", image: "/LabTest/Labliver.png" },
    { name: "Kidney", image: "/LabTest/Labkidney.png" },
    { name: "Bone", image: "/LabTest/Labbone.png" },
    { name: "Thyroid", image: "/LabTest/Labthyroid.png" },
];

const HealthRiskSection = () => {
    return (
        <div className="bg-gray-100 py-6 sm:py-8 md:py-10 px-4 sm:px-8 md:px-16 lg:px-32">
            <div className="flex justify-between items-center mx-auto">
                <h2 className="text-xl sm:text-2xl font-semibold text-center w-full">
                    Test by Health Risks
                </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 mt-4 sm:mt-6 md:mt-8">
                {healthRisks.map((risk, index) => (
                    <div key={index} className="text-center w-1/3 sm:w-auto px-2 sm:px-0">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-md mx-auto">
                            <img src={risk.image} alt={risk.name} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12" />
                        </div>
                        <p className="mt-2 sm:mt-3 text-sm sm:text-base font-medium">{risk.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Health Conditions Section
const healthConditions = [
    { name: "Alcohol", image: "/LabTest/Labicon_.png" },
    { name: "Allergy", image: "/LabTest/Labicon_1.png" },
    { name: "Anemia", image: "/LabTest/Labicon_2.png" },
    { name: "Arthritis", image: "/LabTest/Labicon_3.png" },
    { name: "Cancer", image: "/LabTest/Labicon_4.png" },
    { name: "Diabetes", image: "/LabTest/Labicon_5.png" },
    { name: "Fever", image: "/LabTest/Labicon_6.png" },
    { name: "Pregnancy", image: "/LabTest/labicon_7.png" },
];

const HealthConditionSection = () => {
    return (
        <div className="bg-gray-100 py-8 sm:py-12 md:py-16 px-4 sm:px-6">
            <div className="flex justify-between items-center max-w-7xl mx-auto">
                <h2 className="text-xl sm:text-2xl font-semibold text-center w-full">Test by Health Conditions</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6 md:gap-8 mt-4 sm:mt-6 md:mt-8">
                {healthConditions.map((condition, index) => (
                    <div key={index} className="text-center px-2 sm:px-0">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-white rounded-lg flex items-center justify-center shadow-md mx-auto">
                            <img src={condition.image} alt={condition.name} className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <p className="mt-2 sm:mt-3 text-sm sm:text-base font-medium">{condition.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LabTest;