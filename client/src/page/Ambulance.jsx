import React from 'react';

function Ambulance() {
    return (
        <>
            <div className="min-w-full  ">
                <div className=" bg-white overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        {/* Left Section - Image */}
                        <div className="md:w-1/2 md:p-8 flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-50">
                            <img
                                src="/Ambulance2.png"
                                alt="Emergency Ambulance"
                                className=" w-full h-auto max-h-96 object-contain"
                            />
                        </div>

                        {/* Right Section - Text and Badge */}
                        <div className="md:w-1/2 p-8 md:p-10 bg-gradient-to-br from-teal-600 to-green-700 text-white flex flex-col items-center justify-center text-center space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Your Health is our Priority</h2>
                                <h2 className="text-4xl md:text-5xl font-extrabold text-yellow-300 tracking-wide">INDORE</h2>
                            </div>

                            <div className="bg-blue-900 p-6 rounded-xl shadow-lg w-full max-w-xs transform transition hover:scale-105">
                                <div className="space-y-2">
                                    <p className="text-4xl md:text-5xl font-bold text-white">24/7</p>
                                    <p className="text-xl md:text-2xl font-semibold text-gray-100">EMERGENCY</p>
                                    <div className="pt-2">
                                        <span className="inline-block bg-red-600 text-white px-4 py-2 rounded-md text-lg font-bold tracking-wide">
                                            AMBULANCE SERVICE
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* <div className="pt-4">
                            <button className="bg-yellow-400 hover:bg-yellow-500 text-green-900 font-bold py-3 px-8 rounded-full text-lg shadow-md transition duration-300 transform hover:scale-105">
                                Call Now: 108
                            </button>
                        </div> */}
                            <a href="tel:108" className="mt-4 bg-yellow-400 text-white py-2 px-6 rounded-lg text-lg font-bold shadow-lg hover:bg-yellow-500 transition">
                                Call Now: 108
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mb-20">
                    <iframe
                        title="Map"
                        width="100%"
                        height="700"
                        src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=indore+(My%20Business%20Name)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                    >
                        <a href="https://www.gps.ie/">gps devices</a>
                    </iframe>
                </div>
            </div>


        </>
    );
}

export default Ambulance;