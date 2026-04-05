import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { LoaderCircle } from "lucide-react";
import { loginUser } from "../../features/User/UserSlice.js";
import { loginDoctor } from "../../features/Doctor/DoctorSlice.js";
import AuthShell from "./AuthShell.jsx";
import { normalizeAuthRole } from "./authConfig.js";

const getRedirectTarget = ({ role, location, searchParams }) => {
    const redirect = searchParams.get("redirect");

    if (redirect === "checkout") {
        return "/checkout";
    }

    if (redirect?.startsWith("/")) {
        return redirect;
    }

    const fromPath = location.state?.from?.pathname;
    const fromSearch = location.state?.from?.search || "";

    if (fromPath && fromPath !== "/login") {
        return `${fromPath}${fromSearch}`;
    }

    return role === "doctor" ? "/doctor" : "/user";
};

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const role = normalizeAuthRole(searchParams.get("role"));
    const [formData, setFormData] = useState({ email: "", password: "" });

    const userState = useSelector((state) => state.auth);
    const doctorState = useSelector((state) => state.doctor);

    const isLoading = role === "doctor" ? doctorState.isLoading : userState.isLoading;
    const errorMessage = role === "doctor" ? doctorState.message : userState.message;
    const showError = role === "doctor" ? doctorState.isError : userState.isError;

    const helperCopy = useMemo(
        () =>
            role === "doctor"
                ? "Use your doctor workspace credentials to access appointments, messages, and lab bookings."
                : "Use your patient account to continue with bookings, orders, and your care timeline.",
        [role]
    );

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

        const action =
            role === "doctor"
                ? loginDoctor({ email: formData.email, password: formData.password })
                : loginUser({ email: formData.email, password: formData.password });

        try {
            await dispatch(action).unwrap();
            navigate(getRedirectTarget({ role, location, searchParams }), { replace: true });
        } catch {
            // Toast and error state are handled in the slices.
        }
    };

    return (
        <AuthShell
            role={role}
            mode="login"
            onRoleChange={handleRoleChange}
            title={`Welcome back, ${role === "doctor" ? "doctor" : "patient"}`}
            description={helperCopy}
            footer={
                <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        Need a new account?{" "}
                        <Link to={`/signup?role=${role}`} className="auth-link font-semibold">
                            Create one here
                        </Link>
                    </p>
                    <p>
                        Trouble signing in?{" "}
                        <Link to={`/forgot-password?role=${role}`} className="auth-link font-semibold">
                            Reset your password
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
                        value={formData.email}
                        onChange={handleChange}
                        className="auth-input"
                        required
                    />
                </label>

                <label className="auth-field">
                    <div className="flex items-center justify-between gap-3">
                        <span>Password</span>
                        <Link to={`/forgot-password?role=${role}`} className="auth-link text-xs font-semibold">
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        type="password"
                        name="password"
                        autoComplete={role === "doctor" ? "current-password" : "current-password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        className="auth-input"
                        required
                    />
                </label>

                {showError && errorMessage ? <div className="auth-alert auth-alert--error">{errorMessage}</div> : null}

                <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
                    {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    {isLoading ? "Signing you in..." : "Continue"}
                </button>
            </form>
        </AuthShell>
    );
};

export default Login;
