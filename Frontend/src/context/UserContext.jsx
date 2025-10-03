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
    setSelectedImage
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export default UserContext;
