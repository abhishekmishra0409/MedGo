import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    ArrowLeft,
    ChevronRight,
    Phone,
    Search,
    Star,
    Stethoscope,
    TriangleAlert,
    UserRound,
} from "lucide-react";
import { fetchDoctors } from "../features/Doctor/DoctorSlice.js";
import { BODY_AREAS, getSymptom, matchSymptom, symptomsByArea } from "../data/symptoms.js";
import { SPECIALTIES, getSpecialty } from "../data/specialties.js";
import EmptyState from "../component/ui/EmptyState.jsx";

// Steps live in the URL so the flow is refreshable, shareable, and the browser
// back button behaves — no step state that a reload would silently discard.
const readStep = (params) => {
    if (params.get("specialty")) return 3;
    if (params.get("symptom")) return 2;
    return 1;
};

const EmergencyPanel = ({ symptom, onContinue }) => (
    <section className="rounded-[32px] border-2 border-rose-200 bg-rose-50 p-6 sm:p-8">
        <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white">
                <TriangleAlert className="h-6 w-6" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">This may be an emergency</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">{symptom.label}</h2>
                <p className="mt-3 text-base leading-7 text-slate-800">{symptom.advice}</p>

                <div className="mt-5 flex flex-wrap gap-3">
                    <a
                        href="tel:108"
                        className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-base font-bold text-white transition hover:bg-rose-700 focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                        <Phone className="h-5 w-5" />
                        Call 108 now
                    </a>
                    <Link
                        to="/ambulance"
                        className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-white px-6 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:ring-2 focus-visible:ring-rose-400"
                    >
                        Find an ambulance
                    </Link>
                </div>
            </div>
        </div>

        {/* Booking stays reachable, but never as the obvious next action. */}
        <div className="mt-6 border-t border-rose-200 pt-4">
            <button
                type="button"
                onClick={onContinue}
                className="text-sm font-semibold text-slate-600 underline transition hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-rose-400"
            >
                This is not an emergency — continue booking an appointment
            </button>
        </div>
    </section>
);

const StepHeader = ({ step, title, description, onBack }) => (
    <div className="mb-6">
        {onBack ? (
            <button
                type="button"
                onClick={onBack}
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-teal-700 focus-visible:ring-2 focus-visible:ring-teal-500"
            >
                <ArrowLeft className="h-4 w-4" />
                Back
            </button>
        ) : null}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Step {step} of 3</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
    </div>
);

const BookingFlow = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [params, setParams] = useSearchParams();

    const { doctors, isLoading } = useSelector((state) => state.doctor);

    const [query, setQuery] = useState("");
    const [activeArea, setActiveArea] = useState(BODY_AREAS[0].id);
    const [emergencyAcknowledged, setEmergencyAcknowledged] = useState(false);

    const symptomId = params.get("symptom");
    const specialtyName = params.get("specialty");
    const symptom = symptomId ? getSymptom(symptomId) : null;
    const step = readStep(params);

    const matches = useMemo(() => matchSymptom(query), [query]);
    const areaSymptoms = useMemo(() => symptomsByArea(activeArea), [activeArea]);
    const shownSymptoms = query.trim() ? matches : areaSymptoms;

    useEffect(() => {
        if (step === 3 && specialtyName) {
            dispatch(fetchDoctors({ specialty: specialtyName }));
        }
    }, [dispatch, step, specialtyName]);

    const chooseSymptom = (next) => {
        setEmergencyAcknowledged(false);
        setParams({ symptom: next.id });
    };

    const chooseSpecialty = (name) => {
        setParams({ ...(symptomId ? { symptom: symptomId } : {}), specialty: name });
    };

    const chooseDoctor = (doctorId) => {
        // Hand off to the existing booking form, carrying the symptom so it can
        // prefill the reason instead of presenting an empty 10-character field.
        navigate(`/appointment/${doctorId}${symptomId ? `?symptom=${symptomId}` : ""}`);
    };

    const goBack = () => {
        if (step === 3) setParams(symptomId ? { symptom: symptomId } : {});
        else setParams({});
    };

    // Emergency interrupt — before any specialty or doctor is offered.
    if (symptom?.redFlag && !emergencyAcknowledged) {
        return (
            <div className="section-shell space-y-6 py-10">
                <EmergencyPanel symptom={symptom} onContinue={() => setEmergencyAcknowledged(true)} />
            </div>
        );
    }

    return (
        <div className="section-shell space-y-8 py-10">
            {step === 1 ? (
                <section className="surface-card">
                    <StepHeader
                        step={1}
                        title="What brings you in?"
                        description="Describe the problem in your own words, or pick from the list. We'll suggest the right kind of doctor."
                    />

                    <label className="relative block">
                        <span className="sr-only">Search symptoms</span>
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="e.g. skin rash, back pain, trouble sleeping"
                            autoComplete="off"
                            className="w-full rounded-full border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-50 focus-visible:ring-2 focus-visible:ring-teal-500"
                        />
                    </label>

                    {!query.trim() ? (
                        <div className="mt-5 flex flex-wrap gap-2">
                            {BODY_AREAS.map((area) => (
                                <button
                                    key={area.id}
                                    type="button"
                                    onClick={() => setActiveArea(area.id)}
                                    aria-pressed={activeArea === area.id}
                                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-teal-500 ${
                                        activeArea === area.id
                                            ? "border-teal-200 bg-teal-50 text-teal-800"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:text-teal-700"
                                    }`}
                                >
                                    {area.label}
                                </button>
                            ))}
                        </div>
                    ) : null}

                    <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        {shownSymptoms.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => chooseSymptom(item)}
                                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-teal-500"
                            >
                                <span className="min-w-0">
                                    {item.label}
                                    {item.redFlag ? (
                                        <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-[0.65rem] font-bold uppercase text-rose-700">
                                            Urgent
                                        </span>
                                    ) : null}
                                </span>
                                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                            </button>
                        ))}
                    </div>

                    {query.trim() && !shownSymptoms.length ? (
                        <div className="mt-5">
                            <EmptyState
                                icon={Search}
                                title="No match for that description"
                                message="Try a simpler word like 'fever' or 'rash', or browse by body area."
                            />
                            <button
                                type="button"
                                onClick={() => setQuery("")}
                                className="mt-3 text-sm font-semibold text-teal-700 underline"
                            >
                                Browse by body area instead
                            </button>
                        </div>
                    ) : null}

                    <p className="mt-6 border-t border-slate-100 pt-4 text-sm text-slate-500">
                        Already know who you want to see?{" "}
                        <Link to="/doctorlists" className="font-semibold text-teal-700 underline">Browse all doctors</Link>.
                    </p>
                </section>
            ) : null}

            {step === 2 && symptom ? (
                <section className="surface-card">
                    <StepHeader
                        step={2}
                        title="Who you should see"
                        description={`For ${symptom.label.toLowerCase()}, this is usually handled by the specialty below. You can change it if you'd prefer someone else.`}
                        onBack={goBack}
                    />

                    <button
                        type="button"
                        onClick={() => chooseSpecialty(symptom.specialty)}
                        className="flex w-full items-center justify-between gap-4 rounded-[24px] border-2 border-teal-200 bg-teal-50/60 p-5 text-left transition hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-teal-500"
                    >
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700">
                                <Stethoscope className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xl font-bold text-slate-950">{symptom.specialty}</p>
                                <p className="text-sm text-slate-600">
                                    {getSpecialty(symptom.specialty)?.gloss || "Recommended for you"}
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 text-teal-700" />
                    </button>

                    <details className="mt-5">
                        <summary className="cursor-pointer text-sm font-semibold text-slate-600 hover:text-teal-700">
                            Choose a different specialty
                        </summary>
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {SPECIALTIES.map((item) => (
                                <button
                                    key={item.name}
                                    type="button"
                                    onClick={() => chooseSpecialty(item.name)}
                                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm transition hover:border-teal-200 focus-visible:ring-2 focus-visible:ring-teal-500"
                                >
                                    <span className="font-semibold text-slate-900">{item.name}</span>
                                    <span className="block text-xs text-slate-500">{item.gloss}</span>
                                </button>
                            ))}
                        </div>
                    </details>
                </section>
            ) : null}

            {step === 3 ? (
                <section className="surface-card">
                    <StepHeader
                        step={3}
                        title={`${specialtyName} doctors`}
                        description={symptom ? `Available for ${symptom.label.toLowerCase()}. Highest rated first.` : "Highest rated first."}
                        onBack={goBack}
                    />

                    {isLoading ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {[1, 2, 3, 4].map((item) => (
                                <div key={item} className="h-48 animate-pulse rounded-[24px] bg-slate-100" />
                            ))}
                        </div>
                    ) : doctors?.length ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {doctors.map((doctor) => (
                                <article
                                    key={doctor._id}
                                    className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                                >
                                    <div className="flex items-start gap-4">
                                        {doctor.image ? (
                                            <img src={doctor.image} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-4 ring-teal-50" />
                                        ) : (
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-4 ring-teal-50">
                                                <UserRound className="h-7 w-7" />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold text-slate-950">{doctor.name || doctor.username}</h3>
                                            <p className="text-sm text-slate-600">{doctor.qualification || doctor.specialty}</p>
                                            {/* rating drives the server-side sort but was never shown */}
                                            {doctor.rating > 0 ? (
                                                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                                                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                                                    {doctor.rating} ({doctor.reviews || 0})
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>

                                    {doctor.specializations?.length ? (
                                        <div className="mt-4 flex flex-wrap gap-1.5">
                                            {doctor.specializations.slice(0, 3).map((item) => (
                                                <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{item}</span>
                                            ))}
                                        </div>
                                    ) : null}

                                    <div className="mt-5 flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => chooseDoctor(doctor._id)}
                                            className="btn-primary flex-1 rounded-2xl px-4 py-2.5 text-sm"
                                        >
                                            Book appointment
                                        </button>
                                        <Link
                                            to={`/doctor/${doctor._id}`}
                                            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
                                        >
                                            Profile
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <EmptyState
                                icon={Stethoscope}
                                title={`No ${specialtyName} doctors available yet`}
                                message="Try a different specialty, or browse every doctor on the platform."
                            />
                            <div className="mt-4 flex flex-wrap gap-3">
                                <button type="button" onClick={goBack} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-200">
                                    Pick another specialty
                                </button>
                                <Link to="/doctorlists" className="btn-primary rounded-full px-5 py-2.5 text-sm">
                                    Browse all doctors
                                </Link>
                            </div>
                        </div>
                    )}
                </section>
            ) : null}
        </div>
    );
};

export default BookingFlow;
