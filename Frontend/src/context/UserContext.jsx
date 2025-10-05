import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserDataContext = createContext();

function UserContext({ children }) {

  const serverUrl = "http://localhost:9090";
  const [userData, setUserData] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null)
  const [backendImage, setBackendImage] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  
  // ✅ Fetch current user only if accessToken exists in cookies
  const handelCurrentUser = async () => {
    try {
      const tokenExists = document.cookie.split("; ").find(row => row.startsWith("accessToken="));
      if (!tokenExists) return;

      const result = await axios.get(`${serverUrl}/api/v1/users/current`, {
        withCredentials: true
      });
      setUserData(result.data);
      console.log("Current User:", result.data);
    } catch (error) {
      console.log("User fetch error:", error);
      setUserData(null);
    }
  };


  const getGeminiResponse = async (prompt)=>{

    if (!prompt || prompt.trim() === "") {
    return { message: "No prompt provided" };
    }

     try {
      const result=await axios.post(`
        ${serverUrl}/api/v1/users/asktoassistant`,
        {prompt},
        {withCredentials: true,
        headers: { "Content-Type": "application/json" },
        });
        
          console.log("🤖 Assistant raw:", result.data);
          
          return result.data.response || "I did't understand that.";
    } catch (error) {
       console.log("Gemini API error:",error);
       return { message: "Error fetching assistant response" };
     }
  }

  useEffect(() => {
    handelCurrentUser();
  }, []);

  const value = {
    serverUrl,
    userData,
    setUserData,
    handelCurrentUser,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage, 
    setSelectedImage,
    getGeminiResponse
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export default UserContext;
