import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";
import { registerUser } from "../../features/User/UserSlice.js";
import AuthShell from "./AuthShell.jsx";
import { normalizeAuthRole } from "./authConfig.js";

const Signup = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const role = normalizeAuthRole(searchParams.get("role"));
    const { isLoading, isError, message } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const handleRoleChange = (nextRole) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("role", normalizeAuthRole(nextRole));
        setSearchParams(nextParams, { replace: true });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            await dispatch(
                registerUser({
                    username: formData.username,
                    email: formData.email,
                    phone: formData.phone,
                    password: formData.password,
                })
            ).unwrap();
            navigate("/login?role=user", { replace: true });
        } catch {
            // Slice-level error handling already shows the feedback.
        }
    };

    const doctorSignupState = (
        <div className="space-y-5">
            <div className="auth-alert auth-alert--info">
                Doctor accounts are created through the admin workflow so the clinical profile, specialty, and verification details stay accurate.
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-600">
                Use the doctor login if your account already exists, or ask the platform team to provision your workspace before first sign in.
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <Link to="/login?role=doctor" className="btn-primary auth-submit">
                    Go to doctor login
                </Link>
                <Link to="/forgot-password?role=doctor" className="auth-secondary-button">
                    Reset doctor password
                </Link>
            </div>
        </div>
    );

    return (
        <AuthShell
            role={role}
            mode="signup"
            onRoleChange={handleRoleChange}
            title={role === "doctor" ? "Doctor access setup" : "Create your patient account"}
            description={
                role === "doctor"
                    ? "Doctor onboarding is provisioned centrally so credentials stay linked to verified profile data."
                    : "Create one patient account for appointments, lab tests, and pharmacy orders."
            }
            footer={
                <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        Already have an account?{" "}
                        <Link to={`/login?role=${role}`} className="auth-link font-semibold">
                            Sign in
                        </Link>
                    </p>
                    <p>
                        Need help later?{" "}
                        <Link to={`/forgot-password?role=${role}`} className="auth-link font-semibold">
                            Password recovery
                        </Link>
                    </p>
                </div>
            }
        >
            {role === "doctor" ? (
                doctorSignupState
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="auth-field">
                            <span>Full name</span>
                            <input
                                type="text"
                                name="username"
                                placeholder="Your full name"
                                value={formData.username}
                                onChange={handleChange}
                                className="auth-input"
                                required
                            />
                        </label>

                        <label className="auth-field">
                            <span>Phone number</span>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Enter phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                className="auth-input"
                                required
                            />
                        </label>
                    </div>

                    <label className="auth-field">
                        <span>Email address</span>
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            placeholder="patient@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="auth-input"
                            required
                        />
                    </label>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="auth-field">
                            <span>Password</span>
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
                            <span>Confirm password</span>
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
                    </div>

                    {isError && message ? <div className="auth-alert auth-alert--error">{message}</div> : null}

                    <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
                        {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                        {isLoading ? "Creating account..." : "Create patient account"}
                    </button>
                </form>
            )}
        </AuthShell>
    );
};

export default Signup;
