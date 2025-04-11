import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllTests } from "../features/Labtest/LabtestSlice.js";
import { CheckCircle, Users, ShieldCheck, MapPin, FlaskConical, Home } from "lucide-react";
import LabCard from "../component/Common/LabCard.jsx";
import { Link } from "react-router-dom";

const LabTest = () => {
    const dispatch = useDispatch();
    const { tests, isLoading, isError, message } = useSelector((state) => state.labTest);

    // console.log(tests)
    useEffect(() => {
        dispatch(fetchAllTests());
    }, [dispatch]);

    return (
        <div>
            {/* ✅ Hero Section */}
            <div
                className="relative w-full h-[350px] bg-cover bg-center flex items-center justify-start px-28"
                style={{ backgroundImage: "url('/LabTest/LabTestMain.png')" }}
            >
                <div className="text-left max-w-md">
                    <p className="text-gray-600 text-sm">Book Now!</p>
                    <h1 className="text-4xl font-bold text-gray-900">Check Our Lab Tests</h1>

                    <Link to={"/labtestlists"}>
                        <button className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg shadow-md hover:bg-teal-600 transition-all">
                            Book Tests
                        </button>
                    </Link>
                </div>
            </div>

            <FeatureSection />

            {/* ✅ Lab Test Cards */}
            <div className="flex flex-wrap justify-center gap-8 px-28 my-16">
                {isLoading ? (
                    // Skeleton Loading State
                    [...Array(6)].map((_, index) => (
                        <div
                            key={index}
                            className="w-[300px] h-[200px] p-4 border rounded-lg shadow-lg bg-white animate-pulse"
                        ></div>
                    ))
                ) : isError ? (
                    // Error State
                    <div className="text-center w-full py-8">
                        <p className="text-red-500">{message || "Something went wrong!"}</p>
                    </div>
                ) : (
                    // Success State - Render Tests
                    tests.slice(0, 6).map((test) => (
                        <LabCard key={test._id} test={test} />
                    ))
                )}
            </div>

            <HealthRiskSection />
            <HealthConditionSection />
        </div>
    );
};

// Icons for Feature Section
const features = [
    {icon: <CheckCircle size={50} className="text-teal-600"/>, title: "Most Trusted by", subtitle: "Doctors"},
    {icon: <Users size={50} className="text-teal-600"/>, title: "Over 1 Crore", subtitle: "satisfied customers" },
  { icon: <FlaskConical size={50} className="text-teal-600" />, title: "NABL approved", subtitle: "Labs" },
  { icon: <ShieldCheck size={50} className="text-teal-600" />, title: "3000+ Exclusive", subtitle: "Collection Centers" },
  { icon: <Home size={50} className="text-teal-600" />, title: "Home Collection", subtitle: "Qualified Technicians" },
  { icon: <MapPin size={50} className="text-teal-600" />, title: "PAN India", subtitle: "Footprint" },
];

const FeatureSection = () => {
  return (
    <div className="flex justify-center items-center bg-white p-4 my-16">
      <div className="flex space-x-6">
        {features.map((feature, index) => (
          <div key={index} className="w-36 flex flex-col items-center text-center p-3 border rounded-lg shadow-sm">
            {feature.icon}
            <p className="font-semibold text-sm mt-2">{feature.title}</p>
            <p className="text-xs text-gray-600">{feature.subtitle}</p>
          </div>
        ))}
      </div>
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
    <div className="bg-gray-100 py-10 px-32">
      <div className="flex justify-between items-center mx-auto">
        <h2 className="text-2xl font-semibold">Test by Health Risks</h2>
        {/*<button className="bg-blue-900 text-white px-4 py-2 rounded-lg">View All</button>*/}
      </div>

      <div className="flex justify-center gap-10 mt-8 flex-wrap">
        {healthRisks.map((risk, index) => (
          <div key={index} className="text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md mx-auto">
              <img src={risk.image} alt={risk.name} className="w-12 h-12" />
            </div>
            <p className="mt-3 font-medium">{risk.name}</p>
            {/*<button className="mt-2 bg-blue-900 text-white px-4 py-2 rounded-lg">Know More</button>*/}
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
    <div className="bg-gray-100 py-16 px-6">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold py-3">Test by Health Conditions</h2>
        {/*<button className="bg-blue-900 text-white px-4 py-2 rounded-lg">View All</button>*/}
      </div>

      <div className="flex justify-center gap-8 mt-8 flex-wrap">
        {healthConditions.map((condition, index) => (
          <div key={index} className="text-center">
            <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shadow-md mx-auto">
              <img src={condition.image} alt={condition.name} className="w-12 h-12" />
            </div>
            <p className="mt-3 font-medium">{condition.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Fixed Exports
export default LabTest;
export { HealthRiskSection, FeatureSection, HealthConditionSection };
