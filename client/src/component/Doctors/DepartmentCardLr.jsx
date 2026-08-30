import { useNavigate } from 'react-router-dom';

const DepartmentCardLr = ({ icon, title, category, description }) => {
    const navigate = useNavigate();

    // Was a bare `/doctorlists` — the specialty the patient just clicked was
    // discarded, so the card did nothing but navigate.
    const handleCardClick = () => {
        navigate(`/doctorlists?speciality=${encodeURIComponent(title)}`);
    };
    return (
        <div className=" bg-slate-100 shadow-md rounded-xl p-6 text-center border border-gray-200 cursor-pointer"
             role="button"
             tabIndex={0}
             onKeyDown={(event) => {
                 if (event.key === "Enter" || event.key === " ") {
                     event.preventDefault();
                     handleCardClick();
                 }
             }}
             onClick={handleCardClick}>
            <div
                className="w-20 h-20 border-2 border-white rounded-full flex items-center justify-center mx-auto bg-white">
                <img src={icon} alt={title} className="w-12 h-12"/>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-teal-500 font-medium mt-1">{category}</p>
            <p className="text-gray-600 text-sm mt-2">{description}</p>
            <span className="text-gray-800 font-semibold mt-4 inline-block">
                Get details..
            </span>
        </div>
    );
};

export default DepartmentCardLr;
