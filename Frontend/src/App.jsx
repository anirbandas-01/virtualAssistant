import React,{ useContext, useState} from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Customize from './pages/Customize.jsx'
import { UserDataContext } from './context/UserContext.jsx'
import Home from './pages/Home'
import Customize2 from './pages/Customize2.jsx'


function App() {
  const [count, setCount] = useState(0)
  const {userData, setUserData}= useContext(UserDataContext) 
  return (
    <Routes>
      <Route path='/' element={(userData?.assistantImage && userData?.assistantName)? <Home /> : <Navigate to={"/customize"}/>} />
      <Route path='/signup' element={!userData?<SignUp /> : <Navigate to={"/"}/>}/>
      <Route path='/signin' element={!userData?<SignIn /> : <Navigate to={"/"}/>}/>
      <Route path='/customize' element={userData?<Customize /> : <Navigate to={"/signin"}/>}/>
      <Route path='/customize2' element={userData?<Customize2 /> : <Navigate to={"/signin"}/>}/>
    </Routes>
  )
}

export default App
