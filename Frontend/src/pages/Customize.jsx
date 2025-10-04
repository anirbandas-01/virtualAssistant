import React from 'react'
import Card from '../components/Card.jsx'

import image1 from '../assets/image1.png'
import image2 from '../assets/image2.jpg'
import image3 from '../assets/image3.png'
import image4 from '../assets/image4.png'
import image5 from '../assets/image5.png'
import image6 from '../assets/image6.jpeg'
import image7 from '../assets/image7.jpeg'
import { FaBackward } from "react-icons/fa";
import { RiImageAddFill } from "react-icons/ri";
import { useState } from 'react'
import { useRef } from 'react'
import { useContext } from 'react'
import { UserDataContext } from '../context/UserContext.jsx'
import { useNavigate } from 'react-router-dom'

function Customize() {

  const {serverUrl,
    userData,
    setUserData,
    handelCurrentUser,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage, 
    setSelectedImage } =  useContext(UserDataContext)

  const inputImage = useRef()
  const navigate = useNavigate()
  const handelImage = (e)=> {
    const file = e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }
  
  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#04044b] flex justify-center items-center flex-col p=[20px] relative'>
      
       <FaBackward className='absolute top-[30px] left-[30px] text-white w-[25px] h-[25px]    z-50 cursor-pointer'
       onClick={()=> navigate("/signin")}/>

      <h1 className='text-white mb-[30px] text-[30px] text-center'>Select your <span className='text-green-500'>Assistant</span> image</h1>

      <div className='w-[90%] max-w-[900px] flex justify-center items-center flex-wrap gap-[20px]'>
      
      <Card image={image1}/>
      <Card image={image2}/>
      <Card image={image3}/>
      <Card image={image4}/>
      <Card image={image5}/>
      <Card image={image6}/>
      <Card image={image7}/>
      
    <div className={`w-[100px] h-[160px] lg:w-[150px] lg:h-[250px] bg-[#030326] border-2 border-[#0000ff70] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white flex items-center justify-center 
    ${selectedImage == "input"?"border-4 border-white shadow-2xl shadow-blue-950": null}`} 
     onClick={()=> {inputImage.current.click()
      setSelectedImage('input')
     }}>
       {!frontendImage &&  <RiImageAddFill className='text-white w-[25px] h-[25px]'/>}

       {frontendImage && <img src={frontendImage} className='h-full object-cover' />} 
   
    </div>
 
    <input type='file' accept='image/*' ref={inputImage} hidden onChange={handelImage}/>

    </div>
     
     {/* {selectedImage && <button className='min-w-[150px] h-[60px] mt-[13px] text-black font-semibold bg-white rounded-full text-[19px] cursor-pointer' onClick={()=>navigate("/customize2")}>Next</button>}
     
     */}

      {selectedImage && (
  <button
    className={`relative px-8 h-[60px] mt-[13px] font-semibold rounded-full text-[19px] overflow-hidden transition-all duration-300
      bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 text-white shadow-lg
      hover:scale-105 hover:shadow-2xl active:scale-95`}
    onClick={() => navigate("/customize2")}
  >
    <span className="relative z-10 whitespace-nowrap">
      🚀 Next
    </span>

    {/* Tech glow effect */}
    <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-600 opacity-50 animate-pulse blur-lg"></span>
  </button>
)}

    
    
      
    </div>
  )
}

export default Customize