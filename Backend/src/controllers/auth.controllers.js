import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"


//generate tokens 
const generateAccessTokenAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating and access token")
    }
}


 const signUp = asyncHandler( async (req,res) => {
        
        const { fullName, email, password } = req.body
 

        if(!fullName || fullName.trim() === ""){
            throw new ApiError(400, "Full name is required");
            }
        if(!userName || userName.trim() === ""){
            throw new ApiError(400, "User name is required");
            }      
        if(!email || email.trim() === ""){
            throw new ApiError(400, "Full name is required");
            }      
        if(!password || password.trim() === ""){
            throw new ApiError(400, "password is required");
        }
     

         if(password.length < 6){
             return res
            .status(400)
            .json({message: "password must be at-least 6 character!"})
        }


        const existUser = await User.findOne({
            $or: [{email}, {userName}]
            })
            
        if(existUser){
                throw new ApiError(409, "User already exits with this email or username");
            }

        const user = await User.create({
            fullName,
            userName: userName.toLowerCase(),
            email,
            password
        });

        const { accessToken, refreshToken } = 
          await generateAccessTokenAndRefreshTokens(user._id)

         //set tokens in cookies
         res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: true,      //set true in production with HTTPS
            maxAge: 15*60*1000, //15mins 
         }) 


         res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, //7days
         })
        
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )

        if(!createdUser){
            throw new ApiError(500, "Something went wrong while registering the user")
        }

        return res
        .status(201)
        .json( new ApiResponse(201, createdUser, "User registered Successfully"))
    
});

const loginUser = asyncHandler(async (req, res)=> {
   try {
     const { email, userName, password } = req.body
 
     if(!( userName || email )){
         throw new ApiError(400, " Enter Correct username or email to login")
     }
 
     const user = await User.findOne({
         $or: [{userName}, {email}]
     })
 
     if(!user){
         throw new ApiError(404, "User does not exits")
     }
 
     const isPasswordValid = await user.isPasswordCorrect(password)
 
     if(!isPasswordValid){
         throw new ApiError(401,"Invalid user credentials")
     }
 
     const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(user._id)
 
     const loggedInUser = await User.findById(User._id).select("-password -refreshToken")
 
     const options = {
         httpOnly: true,
         secure: true
     };

     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie("refreshToken", refreshToken, options)
     .json(
         new ApiResponse(
             200,
             {
                 user: loggedInUser, accessToken, refreshToken
             }, "User logged in Successfully"
         )
     );
   } catch (error) {
     throw new ApiError(500, "Something went wrong during login");
   }
})

const logOutUser = asyncHandler(async(req, res)=> {
     try {
        await User.findByIdAndUpdate(
           req.user._id,
           {
               $set: {
                   refreshToken: undefined
               }
           },
           {
               new: true
           }
        )
        const options = {
           httpOnly: true,
           secure: true
        } 
   
        return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
     } catch (error) {
         throw new ApiError(500, "Something went wrong during logout");
     }
})

export{
    signUp,
    loginUser,
    logOutUser
}