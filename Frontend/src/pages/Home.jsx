import React, { useContext, useEffect, useRef, useState } from 'react';
import { UserDataContext } from '../context/UserContext';
import { data, useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImg from '../assets/ai.gif';
import userImg from '../assets/user.gif';

function Home() {

  const {userData, serverUrl, setUserData, getGeminiResponse} = useContext(UserDataContext);
  const navigate = useNavigate();
  const [listening, setListening] =  useState(false);
  
  const [userText, setUserText]= useState("")
  const [aiText, setAiText]= useState("")

  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const synth= window.speechSynthesis;

  //logout function
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

  //speak function
  const speak = (text) => {
       if (!text) return;

       setAiText(text);
       setUserText("");

       const utterance = new SpeechSynthesisUtterance(text);
       isSpeakingRef.current=true;
       utterance.onend = () => {
        isSpeakingRef.current=false;
        setAiText("");
        startRecognition();
       };
       synth.speak(utterance);
  };

  //command handler
  const handelCommand = (data) => {
        const {type, userInput, response}=data;

        if (!response) return;

        speak(response);

         switch (type) {
      case 'google_search':
        window.open(`https://www.google.com/search?q=${encodeURIComponent(userInput)}`, '_blank');
        break;
      case 'youtube_search':
      case 'youtube_play':
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(userInput)}`, '_blank');
        break;
      case 'settings_open':
        alert("Opening device settings is not supported directly from the browser.");
        break;
      case 'music_open':
        window.open('https://music.youtube.com/', '_blank');
        break;
      case 'camera_open':
        alert("Camera access can’t be opened directly. Please use your device camera app.");
        break;
      case 'notes_open':
        window.open('https://keep.google.com/', '_blank');
        break;
      case 'whatsapp_open':
        window.open('https://web.whatsapp.com/', '_blank');
        break;
      case 'gmail_open':
        window.open('https://mail.google.com/', '_blank');
        break;
      case 'facebook_open':
        window.open('https://www.facebook.com/', '_blank');
        break;
      case 'instagram_open':
        window.open('https://www.instagram.com/', '_blank');
        break;
      case 'calculator_open':
        window.open('https://www.google.com/search?q=calculator', '_blank');
        break;
      default:
        // fallback speak already handled above
        break;
    }
     };
  
       //start recognition
        const startRecognition = ()=> {
          if(!recognitionRef.current || isRecognizingRef.current || isSpeakingRef.current) return;
          try {
             recognitionRef.current.start();
             console.log("Recognition started safely");
             //setListening(true);
          } catch (err) {
             if(err.name !== "InvalidStateError") console.error(err);
       }
    };

  useEffect(()=>{
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Speech Recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = true; // ✅ keeps listening after each result
    recognition.interimResults = false; // only get final results
    recognitionRef.current=recognition;
    
    recognition.onstart = () => {
      isRecognizingRef.current= true;
      setListening(true);
      console.log("Recognition started");
    };

    recognition.onend = ()=> {
      isRecognizingRef.current = false;
      setListening(false);
      console.log("Recording ended");
      if(!isSpeakingRef.current){
        setTimeout(()=>{
          if(!isRecognizingRef.current) startRecognition(); 
        },200);
      }
    };

    recognition.onerror = (event) => {
        console.warn("Recognition error:", event.error);
        isRecognizingRef.current = false;
        setListening(false);
        if(event.error !== "aborted" && !isSpeakingRef.current) startRecognition();
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim();
      console.log("heard :", transcript);
      
      if(userData?.assistantName && transcript.toLowerCase().includes(userData.assistantName.toLowerCase())){
        if(isRecognizingRef.current){
          try { recognition.stop(); } catch (e) {}
          isRecognizingRef.current = false;
        }
        if(!transcript) return;

        setUserText(transcript);
        setAiText("");

        const lower = transcript.toLowerCase();
        const openMap = {
         "open google": "https://www.google.com",
         "open youtube": "https://www.youtube.com",
         "open whatsapp": "https://web.whatsapp.com",
         "open gmail": "https://mail.google.com",
         "open facebook": "https://www.facebook.com",
         "open instagram": "https://www.instagram.com",
         "open calculator": "https://www.google.com/search?q=calculator",
         "open notes": "https://keep.google.com",
          "open music": "https://music.youtube.com",
        };
        for(const [cmd, url] of Object.entries(openMap)) {
          if(lower.includes(cmd)){
            const appName = cmd.replace("open ", "");
            speak(`Opening ${appName}`);
            window.open(url, "_blank");
            return;
          }
        }

        const data = await getGeminiResponse(transcript);
        if(data) handelCommand(data);
      }
    };
    
    //start recognition once on mount
     startRecognition();

      return ()=>{
        try {recognition.stop(); } catch(e) {}
        isRecognizingRef.current=false;
      };
  },[userData, getGeminiResponse]);
  
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
        <h1 className='text-green-400 text-[18px] font-serif'>I'm {userData?.assistantName}
        </h1>
      {/*  
      {!aiText && <img src={userImg} alt="" className='w-[200px]'/>}
      {aiText && <img src={aiImg} alt="" className='w-[200px]'/>}
  */} 

     <div className="flex flex-col items-center gap-2 mt-5">
   {!aiText && (
    <div>
      <p className="text-green-400 text-center">{userText}</p>
      <img src={userImg} alt="User speaking" className="w-[200px]" />
    </div>
  )}
  {aiText && (
    <div>
      <p className="text-blue-400 text-center">{aiText}</p>
      <img src={aiImg} alt="AI speaking" className="w-[200px]" />
    </div>
  )}
</div>

    </div>
  )
}

export default Home;