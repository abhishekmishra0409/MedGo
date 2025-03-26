import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Data:", formData);
  };
  return (
   
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-[#5FC4B1] to-[#42887B]">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-80 bg-gradient-to-b from-[#24AEB1] to-[#0F4A4B] text-white">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <label htmlFor="email ">Email</label>
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
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 bg-gradient-to-l from-[#24AEB1] to-[#0F4A4B] cursor-pointer hover:scale-105 transition-all ease-in-out">
          Submit
        </button>
   
      <p className='text-sm'>Does not have an account ? <span onClick={()=> navigate("/signup")}> Signup</span></p>
   </form>
    </div>
  )
}

export default Login
