import React from 'react'
import { useContext } from 'react'
import { UserDataContext } from '../context/UserContext'

function Card({image}) {

  const {serverUrl,
      userData,
      setUserData,
      handelCurrentUser,
      backendImage,
      setBackendImage,
      frontendImage,
      setFrontendImage,
      selectedImage, 
      setSelectedImage } =useContext(UserDataContext)

  return (
    <div className={`w-[90px] h-[160px] lg:w-[150px] lg:h-[250px] bg-[#030326] border-2 border-[#0000ff70] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white
      ${selectedImage === image?"border-4 border-white shadow-2xl shadow-blue-950": null}`} onClick={()=>setSelectedImage(image)}>
        <img src={image} className='h-full object-cover' />
    </div>
  )
}

export default Card