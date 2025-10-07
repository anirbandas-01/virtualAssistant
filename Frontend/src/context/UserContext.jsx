import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const UserDataContext = createContext();

function UserContext({ children }) {

  const serverUrl = "http://localhost:9090";
  const [userData, setUserData] = useState(null);
  const [frontendImage, setFrontendImage] = useState(null)
  const [backendImage, setBackendImage] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [userHistory, setUserHistory] = useState([]);
  
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
    return { type: "error",  response: "No prompt provided" };
    }
      if (!userData?._id) {
    return { type: "error", response: "User data not loaded" };
  }
     try {
      const result=await axios.post(
        `${serverUrl}/api/v1/users/asktoassistant`,
         { prompt },
        { withCredentials: true }
        );
          return result.data;
    } catch (error) {
       console.log("Gemini API error:",error);
       return { type:"error", response: "Error fetching assistant response" };
     }
  }


   // fetch history useEffect
         const fetchUserHistory = async ()=> {
           try {
             const res = await axios.get(`${serverUrl}/api/v1/users/history`,{
               withCredentials:true,
             });
             if(res.data && res.data.history){
               setUserHistory(res.data.history);
             }
           } catch (error) {
             console.error("Failed to fetch user history:", error);
           }
         };
  

  useEffect(() => {
    handelCurrentUser();
  },[]);

  useEffect(() => {
   if(userData?._id){
      fetchUserHistory();
    }
  }, [userData?._id]);  

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
    getGeminiResponse,
    userHistory,
    setUserHistory,
    fetchUserHistory
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export default UserContext;