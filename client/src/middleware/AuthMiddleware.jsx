import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

export const RequireAuth = ({ children, allowedRoles }) => {
    const userState = useSelector((state) => state.auth);
    const doctorState = useSelector((state) => state.doctor);
    const location = useLocation();

    console.log(userState)
    let isAuthenticated = false;
    let role = null;

    // Determine which role is authenticated
    if (userState?.isAuthenticated && userState?.user?.data?.role === "user") {
        isAuthenticated = true;
        role = "user";
    } else if (doctorState?.isAuthenticated && doctorState?.doctor?.role === "doctor") {
        isAuthenticated = true;
        role = "doctor";
    }

    if (!isAuthenticated) {
        // Redirect to correct login page based on route
        const loginPath = allowedRoles?.includes("doctor") ? "/login-option" : "/login";
        toast.warning("Please login to access this page");
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(role)) {
        toast.error("You are not authorized to access this page");
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export const PreventAuth = ({ children }) => {
    const userState = useSelector((state) => state.auth);
    const doctorState = useSelector((state) => state.doctor);
    const location = useLocation();

    const isAuthenticated =
        (userState?.isAuthenticated && userState?.user?.role === "user") ||
        (doctorState?.isAuthenticated && doctorState?.doctor?.role === "doctor");

    if (isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};
