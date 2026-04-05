import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

export const RequireAuth = ({ children, allowedRoles }) => {
    const { isAuthenticated: userAuthenticated, role: userRole } = useSelector((state) => state.auth);
    const { isAuthenticated: doctorAuthenticated, role: doctorRole } = useSelector((state) => state.doctor);
    const location = useLocation();

    let isAuthenticated = false;
    let role = null;

    if (userAuthenticated && userRole === "user") {
        isAuthenticated = true;
        role = "user";
    } else if (doctorAuthenticated && doctorRole === "doctor") {
        isAuthenticated = true;
        role = "doctor";
    }

    if (!isAuthenticated) {
        const loginPath = allowedRoles?.includes("doctor") ? "/login?role=doctor" : "/login?role=user";
        toast.warning("Please login to access this page", { toastId: "auth-required" });
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(role)) {
        toast.error("You are not authorized to access this page", { toastId: "auth-denied" });
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export const PreventAuth = ({ children }) => {
    const { isAuthenticated: userAuthenticated, role: userRole } = useSelector((state) => state.auth);
    const { isAuthenticated: doctorAuthenticated, role: doctorRole } = useSelector((state) => state.doctor);
    const location = useLocation();

    const isAuthenticated =
        (userAuthenticated && userRole === "user") ||
        (doctorAuthenticated && doctorRole === "doctor");

    if (isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};
