import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const resolveSession = ({ userAuthenticated, userRole, doctorAuthenticated, doctorRole, ownerAuthenticated, ownerRole }) => {
    if (userAuthenticated && userRole === "user") return "user";
    if (doctorAuthenticated && doctorRole === "doctor") return "doctor";
    if (ownerAuthenticated && ownerRole === "clinic-owner") return "clinic-owner";
    return null;
};

export const RequireAuth = ({ children, allowedRoles }) => {
    const { isAuthenticated: userAuthenticated, role: userRole } = useSelector((state) => state.auth);
    const { isAuthenticated: doctorAuthenticated, role: doctorRole } = useSelector((state) => state.doctor);
    const { isAuthenticated: ownerAuthenticated, role: ownerRole } = useSelector((state) => state.owner);
    const location = useLocation();

    const role = resolveSession({ userAuthenticated, userRole, doctorAuthenticated, doctorRole, ownerAuthenticated, ownerRole });

    if (!role) {
        toast.warning("Please login to access this page", { toastId: "auth-required" });
        return <Navigate to="/login" state={{ from: location }} replace />;
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
    const { isAuthenticated: ownerAuthenticated, role: ownerRole } = useSelector((state) => state.owner);
    const location = useLocation();

    const role = resolveSession({ userAuthenticated, userRole, doctorAuthenticated, doctorRole, ownerAuthenticated, ownerRole });

    if (role) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    return children;
};
