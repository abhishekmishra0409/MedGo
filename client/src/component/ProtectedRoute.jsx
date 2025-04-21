// src/components/ProtectedRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ role }) => {
    const userAuth = useSelector((state) => state.auth.isAuthenticated);
    const doctorAuth = useSelector((state) => state.doctor.isAuthenticated);

    const isAuthenticated = role === "doctor" ? doctorAuth : userAuth;

    return isAuthenticated ? <Outlet /> : <Navigate to={`/${role}/login`} />;
};

export default ProtectedRoute;
