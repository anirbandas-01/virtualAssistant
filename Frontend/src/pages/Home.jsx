import React, { useContext, useEffect } from 'react'
import { UserDataContext } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Home() {

  const {userData, serverUrl, setUserData,getGeminiResponse} = useContext(UserDataContext)
  const navigate = useNavigate()
  const handelLogOut = async ()=>{
    try {
      const result= await axios.get(`${serverUrl}/api/v1/auth/logout`, 
        {withCredentials:true})
        setUserData(null)
        navigate("/signin")
    } catch (error) {
      setUserData(null)
      console.log(error);
      
    }
  }


  const speak=(text)=>{
       const utterance = new SpeechSynthesisUtterance(text)
       window.SpeechSynthesis.speak(utterance)
  }



  useEffect(()=>{

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Speech Recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }


    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'
    recognition.continuous = true; // ✅ keeps listening after each result
    recognition.interimResults = false; // only get final results
 
    recognition.onstart = () => {
    console.log("🎤 Voice recognition started");
    };

    recognition.onresult= async(e)=>{
      const transcript = e.results[e.results.length - 1][0].transcript.trim()
      console.log("heard :" + transcript);
      
      if(transcript.toLowerCase().includes(userData.assistantName.toLowerCase())){
        const data = await getGeminiResponse(transcript)
        console.log(data);
        speak(data.response)
      }
    } 
    recognition.start()
      
  },[])
  
  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#04044b] flex justify-center items-center flex-col gap-[15px]'>

     <button
         className={`absolute min-w-[250px] h-[60px] mt-[13px] font-semibold top-[20px] right-[20px] rounded-3xl text-[19px] overflow-hidden transition-all duration-300
         bg-gradient-to-r from-green-400 via-teal-500 to-blue-600 text-white shadow-lg
         hover:scale-105 hover:shadow-2xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed`}
         onClick={()=>navigate("/customize")}
         >Customize Your Assistant</button>
        
         <button
         className={`absolute min-w-[100px] h-[60px] mt-[13px] top-[100px] right-[20px] font-semibold rounded-3xl text-[19px] overflow-hidden transition-all duration-300
         bg-gradient-to-r from-green-400 via-teal-500 to-blue-600 text-white shadow-lg
         hover:scale-105 hover:shadow-2xl active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed`}
         onClick={handelLogOut}
         >Log Out</button>

      <div className='w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
         <img src={userData?.assistantImage} alt='' className='h-full object-cover'/>
      </div>
        <h1 className='text-green-400 text-[18px] font-serif'>I'm {userData?.assistantName}</h1>
    </div>
  )
}

export default Home;