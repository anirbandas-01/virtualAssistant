import React, { useState } from 'react'
import bg from "../assets/authBg.png"
import { FaEye } from "react-icons/fa";
import { LuEyeClosed } from "react-icons/lu";

function SignUp() {
 
  const [showPassword, setShowPassword ] =  useState(false);

  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' 
      style={{backgroundImage: `url(${bg})`}}>

     <form className='w-[90%] h-[600px] max-w-[500px] bg-[#0000003d] backdrop-blur-md shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]'>

      <h1 className='text-white text-[30px] font-semibold mb-[30px]'> 
        Register to
        <span className='text-blue-400'>Virtual Assistant</span>  
        </h1>
         
        <input type='text' placeholder='Enter Your Name' className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[20px] rounded-2xl text-[18px]'/>
         
        <input type='email' placeholder='Enter Your Email' className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[20px] rounded-2xl text-[18px]'/>


        <div className='w-full h-[60px] border-2 border-white bg-transparent text-white rounded-2xl text-[18px] relative'>

             <input type={showPassword?"text":"password"} placeholder='Enter Your Password' className='w-full h-full outline-none   placeholder-gray-300 px-[20px] py-[20px] '/>   
               {!showPassword &&
                <FaEye className='absolute top-[20px] right-[20px] text-white' onClick={()=>setShowPassword(true)}/>
               }

                {showPassword &&
                <LuEyeClosed className='absolute top-[20px] right-[20px] text-white' onClick={()=>setShowPassword(false)}/>
               }
               
        </div>

     </form>
    
    
    
    </div>
  )
}

export default SignUp