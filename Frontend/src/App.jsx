import React,{ useState} from 'react'
import { Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Customize from './pages/customize'


function App() {
  const [count, setCount] = useState(0)

  return (
    <Routes>
      <Route path='/signup' element={<SignUp />} />
      <Route path='/signin' element={<SignIn />} />
      <Route path='/customize' element={<Customize />} />
    </Routes>
  )
}

export default App
