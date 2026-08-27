import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const { user } = useSelector((state) => state.auth);
    // Pending doctors/clinic-owners can now log into the main app (see
    // UserService.loginUser) — without this check they'd load the admin
    // shell here too, just to have every API call 403.
    const isAdmin = user?.data?.role === 'admin';

    return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;