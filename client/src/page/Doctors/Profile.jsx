import { useEffect, useState } from 'react';

const DoctorsProfile = () => {
    const [doctorData, setDoctorData] = useState(null);

    useEffect(() => {
        // Get doctor data from local storage
        const storedData = localStorage.getItem('doctor');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            if (parsedData && parsedData) {
                setDoctorData(parsedData);
            }
        }
    }, []);

    if (!doctorData) {
        return <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">Loading doctor data...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Doctor Image and Basic Info */}
                <div className="w-full md:w-1/3">
                    <div className="mb-6">
                        <img
                            src={doctorData.image}
                            alt={doctorData.name}
                            className="w-full h-auto rounded-lg object-cover"
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{doctorData.name}</h2>
                            <p className="text-lg text-indigo-600">{doctorData.specialty}</p>
                            <p className="text-gray-600">{doctorData.qualification}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-700 mb-2">Contact Information</h3>
                            <p className="text-gray-600"><span className="font-medium">Phone:</span> {doctorData.contact?.phone}</p>
                            <p className="text-gray-600"><span className="font-medium">Email:</span> {doctorData.contact?.email}</p>
                            <p className="text-gray-600"><span className="font-medium">Address:</span> {doctorData.contact?.address}</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-gray-700 mb-2">Rating</h3>
                            <div className="flex items-center">
                                <span className="text-yellow-400 text-xl">★</span>
                                <span className="ml-1 text-gray-700">{doctorData.rating} ({doctorData.reviews} reviews)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Doctor Details */}
                <div className="w-full md:w-2/3 space-y-6">
                    {/* Working Hours */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Working Hours</h3>
                        <div className="space-y-3">
                            {doctorData.workingHours?.map((schedule, index) => (
                                <div key={index} className="flex justify-between border-b pb-2">
                                    <span className="font-medium text-gray-700">{schedule.days}</span>
                                    <span className="text-gray-600">{schedule.hours}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Biography */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">About</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            {doctorData.biography?.map((item, index) => (
                                <li key={index} className="text-gray-700">{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Education */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Education</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            {doctorData.education?.map((item, index) => (
                                <li key={index} className="text-gray-700">{item}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Specializations */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Specializations</h3>
                        <div className="flex flex-wrap gap-2">
                            {doctorData.specializations?.map((item, index) => (
                                <span key={index} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Member Since</p>
                                <p className="text-gray-700">
                                    {new Date(doctorData.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Last Updated</p>
                                <p className="text-gray-700">
                                    {new Date(doctorData.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorsProfile;