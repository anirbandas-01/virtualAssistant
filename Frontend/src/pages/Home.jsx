import React, { useContext, useEffect, useRef, useState } from 'react';
import { UserDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import aiImg from '../assets/ai.gif';
import userImg from '../assets/user.gif';
import { FaHamburger } from "react-icons/fa";
import { ImCross } from "react-icons/im";

function Home() {

  const {userData, serverUrl, setUserData, getGeminiResponse, userHistory, fetchUserHistory} = useContext(UserDataContext);
  const navigate = useNavigate();
  const [listening, setListening] =  useState(false);
  
  const [userText, setUserText]= useState("")
  const [aiText, setAiText]= useState("")
  const [menuOpen, setMenuOpen]= useState(false);
  const [history ,setHistory] = useState([]);
  const [showFullHistory, setShowFullHistory] = useState(false);

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

       setHistory((prev)=> [
        ...prev,
        {role: "assistant", text },
       ]);

       setUserText("");

       const utterance = new SpeechSynthesisUtterance(text);
       isSpeakingRef.current=true;

       utterance.onend = () => {
        isSpeakingRef.current=false;
        setAiText("");
        startRecognition();
       };
       synth.cancel();
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
        setHistory((prev) => [...prev, {role: "user", text: transcript }]);

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
      if(userData) fetchUserHistory();
  },[userData, getGeminiResponse]);
  
    return (
    <div className="w-full h-[100vh] bg-gradient-to-t from-black to-[#04044b] flex justify-center items-center flex-col gap-[15px] relative">

      {/* 🍔 Hamburger icon for small screens */}
      <FaHamburger
        className="lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer hover:scale-110 transition-all"
        onClick={() => setMenuOpen(true)}
      />

      {/* 🧩 Overlay menu (visible only when opened on small screens) */}
      {menuOpen && (
        <div className="absolute top-0 left-0 w-full h-full bg-[#0000008a] backdrop-blur-md flex flex-col items-center justify-center z-50 transition-all duration-500">
          <ImCross
            className="text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer hover:rotate-90 transition-transform"
            onClick={() => setMenuOpen(false)}
          />

          <button
            className="min-w-[250px] h-[60px] mt-[13px] font-semibold rounded-3xl text-[19px] bg-gradient-to-r from-green-400 via-teal-500 to-blue-600 text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            onClick={() => {
              setMenuOpen(false);
              navigate("/customize");
            }}
          >
            Customize Your Assistant
          </button>

           <button
            className="min-w-[200px] h-[60px] mt-[20px] font-semibold rounded-3xl text-[19px] bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            onClick={() =>{ 
              fetchUserHistory();
              setShowFullHistory(true);
            }}
          >
            View All History
          </button>

          <button
            className="min-w-[150px] h-[60px] mt-[20px] font-semibold rounded-3xl text-[19px] bg-gradient-to-r from-green-400 via-teal-500 to-blue-600 text-white shadow-lg transition-all hover:scale-105 active:scale-95"
            onClick={() => {
              setMenuOpen(false);
              handelLogOut();
            }}
          >
            Log Out
          </button>    
    </div>
      )}
       {/* 💬 Full History Modal */}
      {showFullHistory && (
        <div className="absolute top-0 left-0 w-full h-full bg-[#000000b3] backdrop-blur-lg flex flex-col items-center justify-center z-50 p-6">
          <ImCross
            className="text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer hover:rotate-90 transition-transform"
            onClick={() => setShowFullHistory(false)}
          />
          <h2 className="text-white text-xl font-semibold mb-4">
            All Previous Conversations
          </h2>

          <div className="w-full max-w-[600px] h-[400px] overflow-y-auto bg-[#ffffff0d] rounded-2xl p-4 shadow-inner">
            {userHistory.length === 0 ? (
              <p className="text-gray-400 text-center">No saved history found.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {userHistory.map((item, index) => (
                  <li
                    key={index}
                    className={`text-sm px-3 py-2 rounded-xl ${
                      item.includes("🧑")
                        ? "bg-green-600/30 text-green-300 text-right"
                        : "bg-blue-600/30 text-blue-300 text-left"
                    }`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 🧠 Assistant */}
      <div className="w-[300px] h-[400px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg">
        <img src={userData?.assistantImage || aiImg} alt="Assistant" className="h-full object-cover" />
      </div>

      <h1 className="text-green-400 text-[18px] font-serif">
        I'm {userData?.assistantName}
      </h1>
          {/* Buttons for large screens */}
<div className="hidden lg:flex flex-col gap-4 absolute top-6 right-6 items-end">
  <button
    className="min-w-[250px] h-[60px] font-semibold rounded-3xl text-[19px] bg-gradient-to-r from-green-400 via-teal-500 to-blue-600 text-white shadow-lg transition-all hover:scale-105 active:scale-95"
    onClick={() => navigate("/customize")}
  >
    Customize Your Assistant
  </button>

  <button
    className="min-w-[200px] h-[60px] font-semibold rounded-3xl text-[19px] bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 text-white shadow-lg transition-all hover:scale-105 active:scale-95"
    onClick={() => {
      fetchUserHistory();
      setShowFullHistory(true);
    }}
  >
    View All History
  </button>

  <button
    className="min-w-[150px] h-[60px] font-semibold rounded-3xl text-[19px] bg-gradient-to-r from-green-400 via-teal-500 to-blue-600 text-white shadow-lg transition-all hover:scale-105 active:scale-95"
    onClick={handelLogOut}
  >
    Log Out
  </button>
</div> 
      {/* 🎙️ Speech area */}
      <div className="flex flex-col items-center gap-2 mt-5 transition-all duration-100 ">
        <div className='text-center relative w-[200px] h-[200px]'>
        {!aiText && (
          <div className="text-center">
            <p className="text-green-400">{userText}</p>
            <img src={userImg} alt="User speaking" className="w-[200px]" />
          </div>
        )}
        {aiText && (
          <div className="text-center">
            <p className="text-blue-400">{aiText}</p>
            <img src={aiImg} alt="AI speaking" className="w-[200px]" />
          </div>
        )}
      </div>
       </div>
       {/* 💬 Current conversation (all screen sizes now) */}
<div className="block w-full max-w-[600px] h-[180px] mt-8 overflow-y-auto bg-[#ffffff0d] rounded-2xl p-4 backdrop-blur-md shadow-inner">
  <h2 className="text-center text-white font-semibold mb-3">
    Current Conversation
  </h2>
  {history.length === 0 ? (
    <p className="text-gray-400 text-center">No conversations yet...</p>
  ) : (
    <ul className="flex flex-col gap-2">
      {history.map((item, index) => (
        <li
          key={index}
          className={`text-sm px-3 py-2 rounded-xl ${
            item.role === "user"
              ? "bg-green-600/30 text-green-300 text-right"
              : "bg-blue-600/30 text-blue-300 text-left"
          }`}
        >
          <strong>{item.role === "user" ? "🧍You: " : "🤖 "}</strong>
          {item.text}
        </li>
      ))}
    </ul>
  )}
</div>

    </div>
  );
}

export default Home;