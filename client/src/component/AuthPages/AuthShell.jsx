import { Link } from "react-router-dom";
import { ArrowLeft, HeartPulse, ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import { authRoleContent, authRoleOptions, normalizeAuthRole } from "./authConfig.js";

const roleIcons = {
    user: UserRound,
    doctor: Stethoscope,
};

const modeCopy = {
    login: {
        eyebrow: "Secure sign in",
        support: "Use the same entry point across patient and doctor flows.",
    },
    signup: {
        eyebrow: "Create account",
        support: "Patient signup is instant. Doctor access is provisioned through the platform team.",
    },
    forgot: {
        eyebrow: "Password recovery",
        support: "Reset links expire automatically for safer account recovery.",
    },
    reset: {
        eyebrow: "New password",
        support: "Choose a fresh password and continue into the same shared workspace.",
    },
    choose: {
        eyebrow: "Choose access",
        support: "Pick the workspace you want to enter and continue with the shared auth flow.",
    },
};

const AuthShell = ({
    role = "user",
    mode = "login",
    title,
    description,
    onRoleChange,
    children,
    footer,
}) => {
    const safeRole = normalizeAuthRole(role);
    const roleContent = authRoleContent[safeRole];
    const RoleIcon = roleIcons[safeRole];
    const activeMode = modeCopy[mode] || modeCopy.login;

    return (
        <div className="auth-stage">
            <div className="section-shell py-6 md:py-10">
                <div className="auth-grid">
                    <aside className="auth-hero">
                        <div className="flex items-center justify-between gap-4">
                            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950">
                                <ArrowLeft className="h-4 w-4" />
                                Back to MedGo
                            </Link>
                            <div className="auth-badge">
                                <ShieldCheck className="h-4 w-4" />
                                Protected access
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="auth-badge auth-badge--soft">
                                <RoleIcon className="h-4 w-4" />
                                {roleContent.modeLabel}
                            </div>
                            <div>
                                <p className="eyebrow">{activeMode.eyebrow}</p>
                                <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950 md:text-5xl">
                                    {roleContent.headline}
                                </h1>
                            </div>
                            <p className="text-base leading-8 text-slate-600 md:text-lg">{roleContent.summary}</p>
                        </div>

                        <div className="grid gap-3">
                            {roleContent.highlights.map((item) => (
                                <div key={item} className="auth-feature">
                                    <HeartPulse className="mt-0.5 h-4 w-4 text-teal-700" />
                                    <p>{item}</p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_24px_48px_rgba(15,23,42,0.08)]">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Why this flow works better</p>
                            <p className="mt-3 text-sm leading-7 text-slate-600">{activeMode.support}</p>
                        </div>
                    </aside>

                    <section className="auth-card">
                        {onRoleChange ? (
                            <div className="auth-tabs">
                                {authRoleOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        data-active={safeRole === option.value}
                                        className="auth-tab"
                                        onClick={() => onRoleChange(option.value)}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        ) : null}

                        <div className="space-y-2">
                            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">{roleContent.label}</p>
                            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950">{title}</h2>
                            {description ? <p className="text-sm leading-7 text-slate-500">{description}</p> : null}
                        </div>

                        <div className="space-y-5">{children}</div>

                        {footer ? <div className="border-t border-slate-200 pt-5">{footer}</div> : null}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AuthShell;
