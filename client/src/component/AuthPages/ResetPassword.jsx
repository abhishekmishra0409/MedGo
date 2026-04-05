import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { toast } from "react-toastify";
import AuthShell from "./AuthShell.jsx";
import { normalizeAuthRole } from "./authConfig.js";
import { authService } from "../../features/User/UserService.js";
import { doctorService } from "../../features/Doctor/DoctorService.js";

const ResetPassword = () => {
    const navigate = useNavigate();
    const params = useParams();
    const role = normalizeAuthRole(params.role);
    const token = params.token;
    const [formData, setFormData] = useState({ password: "", confirmPassword: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const isTokenMissing = useMemo(() => !token || token.trim().length === 0, [token]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isTokenMissing) {
            toast.error("Reset link is invalid");
            return;
        }

        setIsSubmitting(true);

        try {
            const service = role === "doctor" ? doctorService : authService;
            const response = await service.resetPassword({
                token,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
            });

            setIsCompleted(true);
            toast.success(response?.data?.message || "Password reset successfully");
            setTimeout(() => {
                navigate(`/login?role=${role}`, { replace: true });
            }, 900);
        } catch (error) {
            toast.error(error || "Failed to reset password");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthShell
            role={role}
            mode="reset"
            title="Create a new password"
            description="Use a password you have not used recently so the next sign in feels straightforward and safe."
            footer={
                <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        Back to access?{" "}
                        <Link to={`/login?role=${role}`} className="auth-link font-semibold">
                            Open login
                        </Link>
                    </p>
                    <p>
                        Need another link?{" "}
                        <Link to={`/forgot-password?role=${role}`} className="auth-link font-semibold">
                            Request a fresh reset
                        </Link>
                    </p>
                </div>
            }
        >
            {isTokenMissing ? (
                <div className="auth-alert auth-alert--error">This reset link is missing a token. Request a fresh reset link and try again.</div>
            ) : isCompleted ? (
                <div className="space-y-4 rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-5">
                    <div className="auth-alert auth-alert--success">Password updated successfully. Redirecting you to login now.</div>
                    <Link to={`/login?role=${role}`} className="btn-primary auth-submit">
                        Continue to login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <label className="auth-field">
                        <span>New password</span>
                        <input
                            type="password"
                            name="password"
                            autoComplete="new-password"
                            placeholder="At least 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            className="auth-input"
                            required
                        />
                    </label>

                    <label className="auth-field">
                        <span>Confirm new password</span>
                        <input
                            type="password"
                            name="confirmPassword"
                            autoComplete="new-password"
                            placeholder="Repeat your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="auth-input"
                            required
                        />
                    </label>

                    <button type="submit" className="btn-primary auth-submit" disabled={isSubmitting}>
                        {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                        {isSubmitting ? "Updating password..." : "Save new password"}
                    </button>
                </form>
            )}
        </AuthShell>
    );
};

export default ResetPassword;
