import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../features/User/UserSlice.js";
import { loginDoctor } from "../../features/Doctor/DoctorSlice.js";

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "", role: "user" });
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get login status from Redux store
    const { user, doctor } = useSelector((state) => ({
        user: state.auth.user,
        doctor: state.doctor.doctor,
    }));

    useEffect(() => {
        if (user || doctor) {
            navigate("/");
        }
    }, [user, doctor, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.role === "user") {
            dispatch(loginUser({ email: formData.email, password: formData.password }));
        } else {
            dispatch(loginDoctor({ email: formData.email, password: formData.password }));
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-b from-teal-300 to-white">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-80 bg-gradient-to-b from-[#24AEB1] to-[#0F4A4B] text-white">
                <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

                <label htmlFor="role">Select Role</label>
                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full p-2 border rounded mb-3 bg-gray-200 text-black border-gray-400"
                >
                    <option value="user">User</option>
                    <option value="doctor">Doctor</option>
                </select>

                <label htmlFor="email">Email</label>
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-2 border rounded mb-3 bg-gray-200 text-black border-gray-400"
                    required
                />

                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-2 border rounded mb-3 bg-gray-200 text-black border-gray-400"
                    required
                />

                <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 bg-gradient-to-r from-teal-400 to-teal-600 cursor-pointer hover:scale-105 transition-all ease-in-out">
                    Submit
                </button>

                <p className="text-sm">Does not have an account? <span onClick={() => navigate("/signup")} className="cursor-pointer underline">Signup</span></p>
            </form>
        </div>
    );
};

export default Login;
