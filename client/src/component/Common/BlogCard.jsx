import { FaRegCalendarAlt } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import { BsPerson } from "react-icons/bs";

import { useNavigate } from 'react-router-dom';


const BlogCard = ({id, image, author, date, title, description }) => {
    const navigate = useNavigate();

    const handleCardClick = (e) => {
            navigate(`/blog/${id}`);
    };

    return (
        <div className="w-80 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200 cursor-pointer"
             onClick={handleCardClick}
        >
            <img src={image} alt={title} className="w-full h-48 object-cover" />
            <div className="p-4">
                <div className="flex items-center text-gray-600 text-sm mb-2">
                    <BsPerson className="mr-1 text-teal-400" />
                    <span className="mr-2">{author}</span>
                    <FaRegCalendarAlt className="mr-1 text-teal-400" />
                    <span>{date}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-gray-600 text-sm mt-1">{description}</p>
                <button className="text-teal-600 font-semibold flex items-center mt-3 cursor-pointer">
                    read more <FiArrowRight className="ml-1" />
                </button>
            </div>
        </div>
    );
};

export default BlogCard;
