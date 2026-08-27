import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";
import { loginUser } from "../../features/User/UserSlice.js";

import AuthShell from "./AuthShell.jsx";
import PasswordInput from "../ui/PasswordInput.jsx";

const REDIRECT_BY_ROLE = {
    user: "/user",
    doctor: "/doctor",
    "clinic-owner": "/clinic",
};

const getRedirectTarget = ({ role, location, searchParams }) => {
    const redirect = searchParams.get("redirect");

    if (redirect === "checkout") {
        return "/checkout";
    }

    // startsWith("/") alone lets a protocol-relative URL ("//evil.com") through
    // browsers treat that as an absolute external redirect.
    if (redirect?.startsWith("/") && !redirect.startsWith("//")) {
        return redirect;
    }

    const fromPath = location.state?.from?.pathname;
    const fromSearch = location.state?.from?.search || "";

    if (fromPath && fromPath !== "/login") {
        return `${fromPath}${fromSearch}`;
    }

    return REDIRECT_BY_ROLE[role] || "/user";
};

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        setIsLoading(true);

        try {
            const result = await dispatch(loginUser({ email: formData.email, password: formData.password })).unwrap();
            const role = result?.data?.role;
            // Clears the "please login" warning if that's what sent the user
            // here — otherwise it lingers on screen next to "Login successful!"
            // since the two toasts have different ids and don't replace each other.
            toast.dismiss("auth-required");
            toast.success("Login successful!", { toastId: "auth-login-success" });
            navigate(getRedirectTarget({ role, location, searchParams }), { replace: true });
        } catch (error) {
            const message = error?.message || error || "Invalid credentials";
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthShell
            role="user"
            mode="login"
            title="Welcome back"
            description="One account, one sign-in — you'll land in the right workspace automatically."
            footer={
                <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        Need a new account?{" "}
                        <Link to="/signup" className="auth-link font-semibold">
                            Create one here
                        </Link>
                    </p>
                    <p>
                        Trouble signing in?{" "}
                        <Link to="/forgot-password" className="auth-link font-semibold">
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
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="auth-input"
                        required
                    />
                </label>

                <PasswordInput
                    label={
                        <div className="flex items-center justify-between gap-3">
                            <span>Password</span>
                            <Link to="/forgot-password" className="auth-link text-xs font-semibold">
                                Forgot password?
                            </Link>
                        </div>
                    }
                    name="password"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                {errorMessage ? <div className="auth-alert auth-alert--error">{errorMessage}</div> : null}

                <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
                    {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    {isLoading ? "Signing you in..." : "Continue"}
                </button>
            </form>
        </AuthShell>
    );
};

export default Login;
