import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../features/User/UserSlice.js';
import { toast } from 'react-toastify';

const Signup = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isLoading, isError, isSuccess, message } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        phone: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(registerUser(formData))
            .unwrap()
            .then(() => {
                // Registration successful, you can redirect or show success message
                // toast.success("Registration successful! Please login.");
                navigate('/login'); // redirect to login page
            })
            .catch((error) => {
                // Error is already handled in the slice, but you can add additional handling here if needed
                console.error("Registration error:", error);
            });
    };

    return (
        <div>
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-teal-300 to-white">
                <div className="w-96 max-w-md p-6 rounded-lg bg-gradient-to-b from-[#24AEB1] to-[#0F4A4B] backdrop-blur-md shadow-lg">
                    <h2 className="text-2xl font-semibold text-center text-white">Sign Up</h2>
                    {isError && (
                        <div className="p-2 mb-3 text-center text-red-200 bg-red-600 rounded">
                            {message}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="mt-4">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full p-2 mb-3 rounded bg-white/40 placeholder-white text-white focus:outline-none"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 mb-3 rounded bg-white/40 placeholder-white text-white focus:outline-none"
                            required
                        />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-2 mb-3 rounded bg-white/40 placeholder-white text-white focus:outline-none"
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2 mb-3 rounded bg-white/40 placeholder-white text-white focus:outline-none"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full p-2 text-white bg-gradient-to-r from-teal-400 to-teal-600 rounded hover:bg-[#5FC4B1] transition"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Sign Up'}
                        </button>
                    </form>
                    <p className='text-sm text-white text-center mt-3'>
                        Already have an account?
                        <span
                            onClick={() => navigate("/login-option")}
                            className="ml-1 cursor-pointer font-medium hover:underline"
                        >
                            Login
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Signup;