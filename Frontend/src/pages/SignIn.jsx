import React, { useContext, useState } from 'react'
import { useNavigate  } from 'react-router-dom';
import bg from "../assets/authBg.png"
import { FaEye } from "react-icons/fa";
import { LuEyeClosed } from "react-icons/lu";
import { UserDataContext } from '../context/UserContext.jsx';
import axios from 'axios'

function SignIn() {
 
  const [showPassword, setShowPassword ] =  useState(false);
  
  const {serverUrl,userData, setUserData} = useContext(UserDataContext)

  const navigate = useNavigate()
  
  
  const [email, setEmail]= useState("")
  const [password, setPassword]= useState("")
  const [loading, setLoading]= useState(false)
  const [err, setErr] = useState("")

  const handleSignIn = async (e) => {
    e.preventDefault()
    setErr("")
    setLoading(true)
    
    
    if( password.length < 6 ){
      setErr("password must be at-least 6 characters");
      return;
    }
    
/*     try {

       const result = await axios.post(
        `${serverUrl}/api/v1/auth/login`,
        {email, password},
        {withCredentials: true})
         setUserData(result.data)
         setLoading(false)
        navigate("/")
      } catch (error) {
          
          console.log("❌ Axios error:",error);
          setUserData(null)
          setLoading(false)
          setErr(error?.response?.data?.message || "Something went wrong. Try again.")
    } */  
     
          try {
              const response = await axios.post(
      `${serverUrl}/api/v1/auth/login`,
      { email, password },
      { withCredentials: true }
    );

    const user = response.data.data.user;
    console.log("✅ Logged in user:", user);

    setUserData(user);

    // ✅ Redirect logic
    if (user.assistantName && user.assistantImage) {
      navigate("/"); // go home
    } else {
      navigate("/customize"); // go setup
    }

          } catch (error) {
              console.log(error);
    setErr(error?.response?.data?.message || "Something went wrong");
          }finally {
    setLoading(false);
  }
  };

  return (
    <div className='w-full h-[100vh] bg-cover flex justify-center items-center' 
      style={{backgroundImage: `url(${bg})`}}>

     <form className='w-[90%] h-[600px] max-w-[500px] bg-[#0000003d] backdrop-blur-md shadow-lg shadow-black flex flex-col items-center justify-center gap-[20px] px-[20px]'
      onSubmit={handleSignIn}>

      <h1 className='text-white text-[30px] font-semibold mb-[30px]'> 
        Sign In to 
        <span className='text-blue-400'> Virtual Assistant</span>  
        </h1>
         
        <input type='email' placeholder='Enter Your Email' className='w-full h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[20px] rounded-2xl text-[18px]' required onChange={(e)=> setEmail(e.target.value)} value={email}/>


        <div className='w-full h-[60px] border-2 border-white bg-transparent text-white rounded-2xl text-[18px] relative'>

             <input type={showPassword?"text":"password"} placeholder='Enter Your Password' className='w-full h-full outline-none   placeholder-gray-300 px-[20px] py-[20px] ' required onChange={(e)=> setPassword(e.target.value)} value={password}/>   

               {!showPassword &&
                <FaEye className='absolute top-[20px] right-[20px] text-white cursor-pointer' onClick={()=>setShowPassword(true)}/>
               }

                {showPassword &&
                <LuEyeClosed className='absolute top-[20px] right-[20px] text-white cursor-pointer' onClick={()=>setShowPassword(false)}/>
               }
               
        </div>
        
         {err.length > 0 && <p className='text-red-500'>*{err}</p>}

        {/* <button className='min-w-[150px] h-[60px] mt-[13px] text-black font-semibold
         bg-white rounded-full text-[19px]' disabled={loading}>{loading?"Loading...":"Sign In"}</button>
 */}

       <button
         className={`relative min-w-[200px] h-[60px] mt-[13px] font-semibold rounded-full text-[19px] overflow-hidden transition-all duration-300
          bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 text-white shadow-lg
          hover:scale-105 hover:shadow-2xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed`}
          disabled={loading}
        >
        <span className="relative z-10">
        {loading ? "⏳ Loading..." : "🔐 Sign In"}
        </span>

       {/* Tech glow effect */}
       <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-600 opacity-50 animate-pulse blur-lg"></span>
       </button>


        <p className='text-[white] text-[18px] cursor-pointer' 
              onClick={()=>navigate("/signup")}>Want to create a new account ?
           <span className='text-blue-600'>  Sign Up</span>
        </p>
     </form>
    </div>
  )
}

export default SignIn;