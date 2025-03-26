import { useNavigate } from 'react-router-dom';

const DoctorCard = ({ id, name, position, specialty, qualification, hospital, image }) => {
    const navigate = useNavigate();

    const handleCardClick = (e) => {
        // Only navigate if the click wasn't on the appointment button
        if (!e.target.closest('button')) {
            navigate(`/doctor/${id}`);
        }
    };

    const handleAppointmentClick = (e) => {
        e.stopPropagation(); // Prevent card click from firing
        navigate(`/appointment/${id}`);
    };

    return (
        <div
            className="bg-white w-84 shadow-lg rounded-lg p-6 text-center max-w-sm mx-auto cursor-pointer hover:shadow-xl transition-shadow"
            onClick={handleCardClick}
        >
            <img src={image} alt={name} className="w-24 h-24 mx-auto rounded-full border-2 border-gray-300"/>
            <h3 className="text-lg font-bold text-blue-900 mt-4">{name}</h3>
            <p className="text-gray-600 text-sm">{position}</p>

            <div className="mt-4 text-left">
                <p className="font-semibold">Speciality</p>
                <p className="text-gray-600">{specialty}</p>

                <p className="font-semibold mt-2">Qualification</p>
                <p className="text-gray-600">{qualification}</p>

                <p className="font-semibold mt-2">Hospital</p>
                <p className="text-gray-600">{hospital}</p>
            </div>

            <button
                className="mt-4 bg-gradient-to-r from-teal-400 to-teal-700 text-white w-full py-2 rounded-md shadow-md hover:from-blue-600 hover:to-blue-800 transition-colors"
                onClick={handleAppointmentClick}
            >
                Book an Appointment
            </button>
        </div>
    );
};

export default DoctorCard;