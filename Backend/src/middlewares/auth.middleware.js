import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import  User  from "../models/user.models.js"




export const verifyJWT =  asyncHandler(async ( req, res, next )=> {
    try {

         // Get token from cookies or Authorization header
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "").trim();

        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }

        // Verify token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
 
        // Fetch user (exclude password & refreshToken)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token")
    }
})