import React, { useContext, useEffect, useRef, useState } from 'react'
import { UserDataContext } from '../context/UserContext'
import { data, useNavigate } from 'react-router-dom'
import axios from 'axios'

function Home() {

  const {userData, serverUrl, setUserData,getGeminiResponse} = useContext(UserDataContext)
  const navigate = useNavigate()
  const [listening, setListening] =  useState(false)
  const isSpeakingRef = useRef(false)
  const recognitionRef = useRef(null)
  const synth= window.speechSynthesis

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

  const startRecognition = ()=> {
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch (error) {
       if(!error.message.includes("start")){
        console.error("Recognition error:", error);
       }
    }
  };


  const speak=(text)=>{
       const utterance = new SpeechSynthesisUtterance(text);
       isSpeakingRef.current=true
       utterance.onend=()=>{
        isSpeakingRef.current=false
        startRecognition()
       }
       synth.speak(utterance)
  };

  const handelCommand=(data)=> {
        const {type, userInput, response}=data
        speak(response);

        if (type === 'google_search'){
          const query = encodeURIComponent(userInput);
          window.open(`https://www.google.com/search?q=${query}`,
            '_blank');
        }
        if (type === 'youtube_search') {
            const query = encodeURIComponent(userInput);
            window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
         }
        if (type === 'youtube_play') {
            const query = encodeURIComponent(userInput);
            window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
          }

        if (type === 'settings_open') {
          alert("Opening device settings is not supported directly from the browser.");
         }

        if (type === 'music_open') {
          window.open('https://music.youtube.com/', '_blank');
        }

        if (type === 'camera_open') {
         alert("Camera access can’t be opened directly. Please use your device camera app.");
        }

        if (type === 'notes_open') {
         window.open('https://keep.google.com/', '_blank');
       }

        if (type === 'whatsapp_open') {
        window.open('https://web.whatsapp.com/', '_blank');
       }  

        if (type === 'gmail_open') {
         window.open('https://mail.google.com/', '_blank');
       }

        if (type === 'facebook_open') {
        window.open('https://www.facebook.com/', '_blank');
       }

        if (type === 'instagram_open') {
        window.open('https://www.instagram.com/', '_blank');
       }

       if (type === 'calculator_open') {
        window.open('https://www.google.com/search?q=calculator', '_blank');
       }
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
    
    recognitionRef.current=recognition
    
    const isRecognizingRef= {current:false}
     
    const  safeRecognition =()=> {
      if(!isSpeakingRef.current && !isRecognizingRef.current){
        try {
         recognition.start()
         console.log("Recognition requested to start");
        } catch (err) {
          if(err.name !== "InvalidStateError"){
            console.error("start error:", err);
          }
        }
      }
    }

    recognition.onstart= ()=>{
      console.log("Recognition started");
      isRecognizingRef.current= true;
      setListening(true);
    };

    recognition.onend = ()=> {
      console.log("Recording ended");
      isRecognizingRef.current = false;
      setListening(false);
    
      if(!isSpeakingRef.current){
        setTimeout(()=> {
          safeRecognition()
        }, 1000);
      }
    };

    recognition.onerror = (event)=>{
        console.warn("Recognition error:", event.error);
        isRecognizingRef.current = false;
        setListening(false);
        if(event.error !== "aborted" && !isSpeakingRef.current){
          setTimeout(()=>{
            safeRecognition();
          },1000);
        }
    };

    recognition.onresult= async(e)=>{
      const transcript = e.results[e.results.length - 1][0].transcript.trim()
      console.log("heard :" + transcript);
      
      if(transcript.toLowerCase().includes(userData.assistantName.toLowerCase())){
        
        recognition.stop()
        isRecognizingRef.current=false
        setListening(false)
        const data = await getGeminiResponse(transcript)
        handelCommand(data)
      }
    }  

    const fallback= setInterval(()=>{
       if(!isSpeakingRef.current && !isRecognizingRef.current){
        safeRecognition()
       }
    },10000)
     safeRecognition()
      return ()=>{
        recognition.stop()
        setListening(false)
        isRecognizingRef.current=false
        clearInterval(fallback)
      }
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