import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

const DoctorCardModern = ({ id, name, position, specialty, qualification, hospital, image }) => {
    const navigate = useNavigate();

    const handleCardClick = (event) => {
        if (!event.target.closest("button")) {
            navigate(`/doctor/${id}`);
        }
    };

    const handleAppointmentClick = (event) => {
        event.stopPropagation();
        navigate(`/appointment/${id}`);
    };

    return (
        <div className="group relative cursor-pointer rounded-[30px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl" onClick={handleCardClick}>
            <div className="flex items-start justify-between gap-4">
                <img src={image || "/doctor.png"} alt={name} className="h-20 w-20 rounded-3xl object-cover ring-4 ring-teal-50" />
                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">
                    {specialty}
                </span>
            </div>

            <h3 className="mt-5 text-xl font-semibold text-slate-950">{name}</h3>
            <p className="mt-1 text-sm text-slate-500">{position || qualification}</p>

            <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-start gap-3">
                    <CalendarDays className="mt-0.5 h-4 w-4 text-teal-700" />
                    <span>{qualification || "Verified medical professional"}</span>
                </div>
                <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-teal-700" />
                    <span>{hospital || "Location shared during booking"}</span>
                </div>
            </div>

            <button className="btn-primary mt-6 w-full rounded-2xl px-4 py-3 text-sm" onClick={handleAppointmentClick}>
                Book appointment
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
        </div>
    );
};

export default DoctorCardModern;
