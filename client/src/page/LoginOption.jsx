import React from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const navigate = useNavigate();
    return (
        <>

        <div className=' flex justify-center items-center w-full min-h-screen bg-gradient-to-b from-teal-300 to-white'>
            
        <div className='text-white w-92  bg-gradient-to-b from-[#24AEB1] to-[#0F4A4B] border border-blue-400 p-12 rounded-2xl flex flex-col gap-2'>
            <h2>Welcome to DawaiLink</h2>
            <img src="/logo.png" alt="Logo" />
            <p>Login to enjoy the features we’ve provided
                and stay healthy!</p>
            
            <p>Login as</p>
            
            <div >
                <button
                className='p-2 w-full border border-gray-300 rounded-xl'
                onClick={()=> navigate("/login")}
                >
                    Patient
                </button>
            </div>

            <div>
                <button
                className='p-2 w-full border border-gray-300 rounded-xl'
                onClick={()=> navigate("/login")}
                >
                    Doctor
                </button>
             </div>
        
        </div>

        
        </div>
        </>
    );
}

export default Login;