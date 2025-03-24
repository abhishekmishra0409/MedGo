const DoctorCard = ({ name, position, speciality, qualification, hospital, image }) => {
    return (
        <div className="bg-white shadow-lg rounded-lg p-6 text-center max-w-sm mx-auto">
            <img src={image} alt={name} className="w-24 h-24 mx-auto rounded-full border-2 border-gray-300"/>
            <h3 className="text-lg font-bold text-blue-900 mt-4">{name}</h3>
            <p className="text-gray-600 text-sm">{position}</p>

            <div className="mt-4 text-left">
                <p className="font-semibold">Speciality</p>
                <p className="text-gray-600">{speciality}</p>

                <p className="font-semibold mt-2">Qualification</p>
                <p className="text-gray-600">{qualification}</p>

                <p className="font-semibold mt-2">Hospital</p>
                <p className="text-gray-600">{hospital}</p>
            </div>

            <div className="mt-6 flex justify-center gap-4">
                <button className="bg-gradient-to-r from-green-300 to-green-500 text-white px-4 py-2 rounded-md shadow-md">
                    Request To Call
                </button>
                <button className="bg-gradient-to-r from-teal-300 to-teal-500 text-white px-4 py-2 rounded-md shadow-md">
                    Chat Section
                </button>
            </div>

            <button className="mt-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white w-full py-2 rounded-md shadow-md">
                Book an Appointment
            </button>
        </div>
    );
};

export default DoctorCard;
