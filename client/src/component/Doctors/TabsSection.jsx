import { useState } from "react";

const TabsSection = () => {
    const [activeTab, setActiveTab] = useState("specialties");

    return (
        <div className="bg-white py-10 px-32">
            {/* Tabs */}
            <div className="flex justify-center border-b border-gray-300">
                <button
                    className={`py-3 px-6 text-lg font-medium ${activeTab === "specialties" ? "text-teal-500 border-b-2 border-teal-500" : "text-gray-500"}`}
                    onClick={() => setActiveTab("specialties")}
                >
                    Specialties
                </button>
                <button
                    className={`py-3 px-6 text-lg font-medium ${activeTab === "clinic" ? "text-teal-500 border-b-2 border-teal-500" : "text-gray-500"}`}
                    onClick={() => setActiveTab("clinic")}
                >
                    Clinic
                </button>
            </div>

            {/* Content */}
            <div className="text-center px-4 mt-8">
                <h2 className="text-2xl font-bold text-gray-900">Explore our Centres of Clinical Excellence</h2>
                <p className="text-gray-600 mt-3">
                    Apollo Hospitals has dedicated Centres of Excellence for several key specialties and super specialties.
                    They are unique and state-of-the-art facilities spread across several of the Apollo hospital locations,
                    and each Centre of Excellence stands out as a citadel of world-class clinical outcomes.
                </p>
                <p className="text-gray-600 mt-4 font-medium">Learn about the world-class healthcare we provide</p>
            </div>
        </div>
    );
};

export default TabsSection;
