import React, { createContext } from 'react'

export const UserDataContext = createContext()

function UserContext({ children }) {

    const serverUrl = "http://localhost:9090"
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