import React from 'react';
import { useContext,useState, useEffect } from 'react';
import { UserDataContext } from '../context/UserContext';
import axios from 'axios';
import { FaBackward } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';


function Customize2() {
    const {userData, backendImage, selectedImage, serverUrl, setUserData } = useContext(UserDataContext)
    const [assistantName,setAssistantName] = useState(userData?.assistantName || "")
    const [loading, setLoading] = useState(false)
    const [voiceGender, setVoiceGender] = useState(userData?.voiceGender || localStorage.getItem("voiceGender") || "female");
    const navigate = useNavigate();

    const handleUpdateAssistant = async ()=> {

      if(loading) return;

      setLoading(true);
      try {
        let formData = new FormData();
        formData.append("assistantName", assistantName);
        formData.append("voiceGender", voiceGender);
        
        if(backendImage instanceof File){
          formData.append("assistantImage", backendImage)
        }
        else if(selectedImage){
          formData.append("imageUrl", selectedImage)
        }

        const result = await axios.post(`${serverUrl}/api/v1/users/update`,
           formData,
            { 
             withCredentials: true,
             headers: {"Content-Type": "multipart/form-data"},
        });

        localStorage.setItem("voiceGender", voiceGender);
        setLoading(false)
        console.log(result.data);
        setUserData(result.data);
        navigate("/")
      } catch (error) {
          console.log("Update error:", error.response?.data || error);
          } finally{
            setLoading(false);
          }
    };

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p=[20px] relative'>
      <FaBackward className='absolute top-[30px] left-[30px] text-white w-[25px] h-[25px] cursor-pointer'
       onClick={()=> navigate("/customize")}/>

        <h1 className='text-white mb-[30px] text-[30px] text-center'>Enter Your <span className='text-green-500'>Assistant Name</span></h1>

         <input type='text' placeholder='eg. Jervis' className='w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[20px] rounded-2xl text-[18px]' required onChange={(e)=> setAssistantName(e.target.value)} value={assistantName}/>

        <div className='text-center mb-[30px]'>
          <h2 className='text-white text-[22px] mb-[15px]'>
             🎵 Choose Voice Personality 
          </h2>
             <div className='flex justify-center gap-6'>
              <button 
              onClick={()=> setVoiceGender("male")}
              className={`px-6 py-3 rounded-full text-[18px] font-semibold transition-all duration-300 ${voiceGender === "male"
                ? "bg-blue-500 text-white scale-105 shadow-xl" 
                : "bg-gray-200 text-black hover:scale-105"
                }`}>
                  Male Voice
                </button>
                
          <button
            onClick={() => setVoiceGender("female")}
            className={`px-6 py-3 rounded-full text-[18px] font-semibold transition-all duration-300 
              ${voiceGender === "female"
                ? "bg-pink-500 text-white scale-105 shadow-xl"
                : "bg-gray-200 text-black hover:scale-105"
            }`}
          >
            Female Voice
          </button>
        </div>
      </div>
          
          {assistantName && (
              <button
                className={`relative px-8 h-[60px] mt-[20px] font-semibold rounded-full text-[18px] overflow-hidden transition-all duration-300
                  ${loading 
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 opacity-70 cursor-not-allowed" 
                    : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg hover:scale-105 hover:shadow-2xl active:scale-95"
                  }`}
                disabled={loading}
                onClick={handleUpdateAssistant}
              >
                <span className="relative z-10 whitespace-nowrap">
                  {loading ? "Loading..." : "✨ Create your Assistant"}
                </span>

                {/* Floating color animation */}
                {!loading && (
                  <span className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-60 animate-pulse blur-lg"></span>
                )}
              </button>
            )}

         
    </div>
  )
}

export default Customize2