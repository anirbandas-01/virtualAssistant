import React,{ useContext, useState} from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Customize from './pages/Customize.jsx'
import { UserDataContext } from './context/UserContext.jsx'
import Home from './pages/Home'
import Customize2 from './pages/Customize2.jsx'


function App() {
  const {userData, setUserData}= useContext(UserDataContext)
  
 /*  const devMode = false
  if (devMode){
    return (
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/signin' element={<SignIn />} />
        <Route path='/customize' element={<Customize />} />
        <Route path='/customize2' element={<Customize2 />} />
      </Routes>
    )
  } */
  return (
    <Routes>
      <Route path='/' element={userData?
           (userData.assistantImage && userData.assistantName?(
             <Home />
            ) : (
            <Navigate to="/customize"/>
             )) : (
             <Navigate to= "/signin"/>
             )} />

      <Route path='/signup'
       element={
         !userData?(
          <SignUp />
          ) : userData.assistantName && userData.assistantImage? (
             <Navigate to= "/"/>
              ) : (
                <Navigate to="/customize" />
              ) }/>
      
      <Route path='/signin'
       element={
        !userData?(
          <SignIn /> 
            ): userData.assistantName && userData.assistantImage?(
             <Navigate to= "/" />
               ):(
                 <Navigate to="/customize" />
               )}/>

      <Route path='/customize'
         element={
           userData? (
             <Customize />
               ) :(
                  <Navigate to= "/signup" /> 
                 )}/>

      <Route path='/customize2'
           element={
             userData?(
               <Customize2 />
                 ) :(
                   <Navigate to= "/signup"/> 
                    )}/>
    </Routes>
  )
}

export default App
