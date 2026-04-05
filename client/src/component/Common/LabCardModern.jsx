import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowRight, Clock3, FileText } from "lucide-react";

const LabCardModern = ({ test }) => {
    const navigate = useNavigate();

    const handleBookClick = () => {
        if (!test._id) {
            toast.error("Test information is incomplete");
            return;
        }

        navigate(`/book-lab-test/${test._id}`);
    };

    return (
        <div className="relative rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex flex-wrap items-center gap-2">
                {test?.isActive && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>}
                {test?.isPopular && <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Popular</span>}
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                    {test.category?.toUpperCase()}
                </span>
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-950">{test.name}</h2>
            <p className="mt-2 text-sm text-slate-500">Code: {test.code}</p>
            <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{test.description}</p>

            <div className="mt-4">
                {test.discount ? (
                    <>
                        <span className="text-2xl font-semibold text-slate-950">
                            Rs. {test.price - (test.price * test.discount) / 100}
                        </span>
                        <span className="ml-2 text-sm text-slate-400 line-through">Rs. {test.price}</span>
                        <span className="ml-2 text-sm font-semibold text-emerald-600">{test.discount}% OFF</span>
                    </>
                ) : (
                    <p className="text-2xl font-semibold text-slate-950">Rs. {test.price}</p>
                )}
            </div>

            <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-teal-700" />
                    Report time: {test.reportTime || "24"} hours
                </div>
                <div className="flex items-start gap-2">
                    <FileText className="mt-0.5 h-4 w-4 text-teal-700" />
                    <span>{test.preparationInstructions || "No special preparation required"}</span>
                </div>
            </div>

            <button className="btn-primary mt-6 w-full rounded-2xl px-4 py-3 text-sm" onClick={handleBookClick}>
                Book lab test
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    );
};

export default LabCardModern;
