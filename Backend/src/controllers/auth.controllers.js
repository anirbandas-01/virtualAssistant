import User  from "../models/user.models.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";


//generate tokens 
const generateAccessTokenAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)

        if(!user){
            throw new ApiError(404, "User not found while generating tokens");
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating and access token")
    }
};


const signUp = asyncHandler( async (req,res) => {
        
        const { fullName, email, password } = req.body
 

        if(!fullName || fullName.trim() === ""){
            throw new ApiError(400, "Full name is required");
            }
        /* if(!userName || userName.trim() === ""){
            throw new ApiError(400, "User name is required");
            } */      
        if(!email || email.trim() === ""){
            throw new ApiError(400, "email is required");
            }      
        if(!password || password.trim() === ""){
            throw new ApiError(400, "password is required");
        }

         if(password.length < 6){
            throw new ApiError(400, "password must be at-least 6 character!")
        }


        const existUser = await User.findOne({ email });
            
        if(existUser){
                throw new ApiError(409, "User already exits with this email");
            }

        const user = await User.create({
            fullName,
            email,
            password
        });

        const { accessToken, refreshToken } = 
          await generateAccessTokenAndRefreshTokens(user._id)

         const isProduction = process.env.NODE_ENV === "production";
         const cookieOptions = {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? "None" : "Lax",
            };
        
        const loggedInUser = await User.findById(user._id).select(
            "-password -refreshToken"
        );

        return res
        .status(201)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json( new ApiResponse(201, { user: loggedInUser }, "User registered Successfully"))
    
});

const loginUser = asyncHandler(async (req, res)=> {
   try {
     const { email, password } = req.body
 
     if(! email ){
         throw new ApiError(400, " Enter Correct  email to login")
     }
 
     const user = await User.findOne({email})
 
     if(!user){
         throw new ApiError(404, "User does not exits")
     }
 
     const isPasswordValid = await user.isPasswordCorrect(password)
 
     if(!isPasswordValid){
         throw new ApiError(401,"Invalid user credentials")
     }
 
     const { accessToken, refreshToken } = await generateAccessTokenAndRefreshTokens(user._id)
 
     const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
 
     const isProduction = process.env.NODE_ENV === "production";
     const cookieOptions = {
         httpOnly: true,
         secure: isProduction,
         sameSite: isProduction ? "None" : "Lax",
     };

     return res
     .status(200)
     .cookie("accessToken", accessToken, cookieOptions)
     .cookie("refreshToken", refreshToken, cookieOptions)
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
        );
        
        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "None" : "Lax",
        };
   
        return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged Out"))
     } catch (error) {
         throw new ApiError(500, "Something went wrong during logout");
     }
})

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized: No refresh token provided");
    }

    // ✅ Verify JWT signature first
    let decodedToken;
    try {
      decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    // ✅ Find user
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "User not found");
    }

    // ✅ Ensure DB refreshToken matches the incoming one
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token mismatch or already used");
    }

    // ✅ Generate new tokens and save refreshToken
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessTokenAndRefreshTokens(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    // ✅ Set cookies (works both in dev & prod)
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { user: { id: user._id, email: user.email }, accessToken, refreshToken: newRefreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Refresh failed");
  }
});



const getCurrentUser = asyncHandler(async (req, res)=> {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetch successfully"))
})

export{
    signUp,
    loginUser,
    logOutUser,
    refreshAccessToken,
    getCurrentUser
}