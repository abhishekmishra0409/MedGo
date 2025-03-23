const DepartmentCard = ({ icon, title, category, description }) => {
    return (
        <div className="w-70 p-6 text-center ">
            <div
                className="w-20 h-20 border-2 border-white rounded-full flex items-center justify-center mx-auto bg-slate-100">
                <img src={icon} alt={title} className="w-12 h-12"/>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-teal-500 font-medium mt-1">{category}</p>
            <p className="text-gray-600 text-sm mt-2">{description}</p>
        </div>
    );
};

export default DepartmentCard;
