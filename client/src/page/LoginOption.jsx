import { Link } from "react-router-dom";
import { ArrowRight, Stethoscope, UserRound } from "lucide-react";
import AuthShell from "../component/AuthPages/AuthShell.jsx";

const loginChoices = [
    {
        role: "user",
        label: "Continue as patient",
        description: "Open your bookings, lab tests, orders, and account progress from one place.",
        icon: UserRound,
    },
    {
        role: "doctor",
        label: "Continue as doctor",
        description: "Enter your workspace for appointments, blogs, patient communication, and lab requests.",
        icon: Stethoscope,
    },
];

function LoginOption() {
    return (
        <AuthShell
            role="user"
            mode="choose"
            title="Choose your MedGo access"
            description="Patient and doctor accounts now share the same sign-in design, then route into the right workspace after authentication."
            footer={
                <div className="text-sm text-slate-500">
                    <p>
                        Need a patient account first?{" "}
                        <Link to="/signup?role=user" className="auth-link font-semibold">
                            Open signup
                        </Link>
                    </p>
                </div>
            }
        >
            <div className="grid gap-4">
                {loginChoices.map((choice) => {
                    const Icon = choice.icon;

                    return (
                        <Link key={choice.role} to={`/login?role=${choice.role}`} className="auth-choice-card group">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-base font-semibold text-slate-900">{choice.label}</p>
                                <p className="mt-1 text-sm leading-7 text-slate-500">{choice.description}</p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:text-teal-700" />
                        </Link>
                    );
                })}
            </div>
        </AuthShell>
    );
}

export default LoginOption;
