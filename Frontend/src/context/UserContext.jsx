import React, { createContext, useEffect } from 'react'

export const UserDataContext = createContext()

function UserContext({ children }) {

    const serverUrl = "http://localhost:9090"
    const [userData, setUserData] = useState(null)

    const handelCurrentUser = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/user/current`, {withCredentials:true})
        setUserData(result.data)
        console.log(result.data);
        
      } catch (error) {
         console.log(error); 
      }
    } 

     useEffect(() => {
      handelCurrentUser()
     },[])

    const value= {
        serverUrl
    }
  return (
    <div>
        <UserDataContext.Provider value={value}>
           {children}
        </UserDataContext.Provider>
    </div>
  )
}

export default UserContext