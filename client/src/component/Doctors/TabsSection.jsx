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
            <div className="text-center px-12 mt-8">
                <h2 className="text-2xl font-bold text-gray-900">Explore our Centres of Clinical Excellence</h2>
                <p className="text-gray-600 mt-3">
                Dedicated Centres of Excellence for various key specialties and super specialties, providing state-of-the-art facilities and advanced medical care, ensuring world-class clinical outcomes across multiple locations.
                </p>
                <p className="text-gray-600 mt-4 font-medium">Learn about the world-class healthcare we provide</p>
            </div>
        </div>
    );
};

export default TabsSection;
