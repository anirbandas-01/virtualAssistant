import React from 'react'
import { useContext } from 'react'
import { useState } from 'react'
import { UserDataContext } from '../context/UserContext'

function Customize2() {
    const {userData } = useContext(UserDataContext)
    const [assistantName,setAssistantName] = useState(userData?.assistantName || "")

  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#030353] flex justify-center items-center flex-col p=[20px]'>
        <h1 className='text-white mb-[30px] text-[30px] text-center'>Enter Your <span className='text-green-500'>Assistant Name</span></h1>

         <input type='text' placeholder='eg. Jervis' className='w-full max-w-[600px] h-[60px] outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-[20px] py-[20px] rounded-2xl text-[18px]' required onChange={(e)=> setAssistantName(e.target.value)} value={assistantName}/>

         { assistantName && <button className='min-w-[150px] h-[60px] mt-[13px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer' onClick={()=>navigate("/customize2")}>Next</button> }
    </div>
  )
}

export default Customize2