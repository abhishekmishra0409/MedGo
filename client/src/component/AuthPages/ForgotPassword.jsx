import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LoaderCircle, MailCheck } from "lucide-react";
import { toast } from "react-toastify";
import AuthShell from "./AuthShell.jsx";
import { normalizeAuthRole } from "./authConfig.js";
import { authService } from "../../features/User/UserService.js";
import { doctorService } from "../../features/Doctor/DoctorService.js";

const ForgotPassword = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const role = normalizeAuthRole(searchParams.get("role"));
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resetState, setResetState] = useState(null);

    const handleRoleChange = (nextRole) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("role", normalizeAuthRole(nextRole));
        setSearchParams(nextParams, { replace: true });
        setResetState(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const service = role === "doctor" ? doctorService : authService;
            const response = await service.requestPasswordReset(email);
            setResetState(response?.data || null);
            toast.success(response?.data?.message || "Password reset started");
        } catch (error) {
            toast.error(error || "Failed to start password reset");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthShell
            role={role}
            mode="forgot"
            onRoleChange={handleRoleChange}
            title="Forgot your password?"
            description="Enter the email address linked to your account and we will generate a secure reset link."
            footer={
                <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        Remembered it?{" "}
                        <Link to={`/login?role=${role}`} className="auth-link font-semibold">
                            Go back to login
                        </Link>
                    </p>
                    <p>
                        Need a new patient account?{" "}
                        <Link to="/signup?role=user" className="auth-link font-semibold">
                            Sign up
                        </Link>
                    </p>
                </div>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <label className="auth-field">
                    <span>Email address</span>
                    <input
                        type="email"
                        name="email"
                        autoComplete="email"
                        placeholder={role === "doctor" ? "doctor@medgo.com" : "patient@example.com"}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="auth-input"
                        required
                    />
                </label>

                <button type="submit" className="btn-primary auth-submit" disabled={isSubmitting}>
                    {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
                    {isSubmitting ? "Generating reset link..." : "Send reset link"}
                </button>
            </form>

            {resetState ? (
                <div className="space-y-4 rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-5">
                    <div className="auth-alert auth-alert--success">
                        {resetState.message || "If the account exists, a reset link has been created."}
                    </div>
                    {resetState.resetUrl ? (
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-slate-700">Development reset link</p>
                            <a
                                href={resetState.resetUrl}
                                className="block break-all rounded-[20px] border border-emerald-200 bg-white px-4 py-3 text-sm text-teal-700 transition hover:border-teal-300 hover:text-teal-800"
                            >
                                {resetState.resetUrl}
                            </a>
                            <p className="text-xs leading-6 text-slate-500">
                                Email delivery is not wired yet, so the backend exposes the reset URL directly in development.
                            </p>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </AuthShell>
    );
};

export default ForgotPassword;
