import { NavLink } from "react-router-dom";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const NavItem = ({ item }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (item.children) {
        return (
            <div className="flex flex-col">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`flex items-center justify-between w-full rounded-2xl p-3 transition-colors duration-200 ${
                        isExpanded ? "bg-teal-50 text-teal-700" : "hover:bg-slate-50"
                    }`}
                >
          <span className="flex items-center gap-2">
            {item.icon && <item.icon className="w-5 h-5" />}
              <span>{item.name}</span>
          </span>
                    {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    )}
                </button>
                {isExpanded && (
                    <div className="pl-6 mt-1 space-y-1">
                        {item.children.map((child) => (
                            <NavItem key={child.path} item={child} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <NavLink
            to={item.path}
            className={({ isActive }) =>
                `flex items-center gap-2 rounded-2xl p-3 transition-colors duration-200 ${
                    isActive
                        ? "bg-teal-50 text-teal-700 hover:bg-teal-100 font-medium"
                        : "hover:bg-slate-50"
                }`
            }
        >
            {item.icon && <item.icon className="w-5 h-5" />}
            <span>{item.name}</span>
        </NavLink>
    );
};

export default NavItem;
