const DoctorCard = ({ image, name, specialty }) => {
    return (
        <div className="w-64 bg-white shadow-lg rounded-xl overflow-hidden text-center border border-gray-200">
            <img src={image} alt={name} className="w-full h-60 object-cover" />
            <div className="p-4">
                <p className="text-gray-500 text-sm my-3">{specialty}</p>
                <h3 className="text-lg font-semibold text-gray-800 mt-1">{name}</h3>
            </div>
        </div>
    );
};

export default DoctorCard;
