import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const navigate = useNavigate();
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
        console.log("User Data:", formData);
      };
  return (
    <div>
      
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-teal-300 to-white">
      <div className="w-96 max-w-md p-6 rounded-lg bg-gradient-to-b from-[#24AEB1] to-[#0F4A4B] backdrop-blur-md shadow-lg">
        <h2 className="text-2xl font-semibold text-center text-white">Sign Up</h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} className="w-full p-2 mb-3 rounded bg-white/40 placeholder-white text-white focus:outline-none" />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-2 mb-3 rounded bg-white/40 placeholder-white text-white focus:outline-none" />
          <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} className="w-full p-2 mb-3 rounded bg-white/40 placeholder-white text-white focus:outline-none" />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-2 mb-3 rounded bg-white/40 placeholder-white text-white focus:outline-none" />
          <button type="submit" className="w-full p-2 text-white bg-gradient-to-r from-teal-400 to-teal-600 rounded hover:bg-[#5FC4B1] transition">Sign Up</button>
        </form>
        <p className=' text-sm text-white'>Already have an account? <span onClick={()=> navigate("/login-option")}>Login</span></p>
      </div>
    </div>
    </div>
  )
}

export default Signup
