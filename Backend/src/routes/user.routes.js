import express from "express";
import { signUp, loginUser, logOutUser, getCurrentUser } from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const userRouter = express.Router()
 
userRouter.route("/signup", signUp)

userRouter.route("/signin").post(loginUser)

userRouter.route("/logout").post(verifyJWT,logOutUser)
userRouter.route("/current-user").get(verifyJWT, getCurrentUser)

export default userRouter