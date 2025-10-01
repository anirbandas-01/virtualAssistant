import express from "express";
import { signUp, loginUser, logOutUser, getCurrentUser, refreshAccessToken } from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const userRouter = express.Router()
 
userRouter.route("/signup").post(signUp)
userRouter.route("/login").post(loginUser)
userRouter.route("/refresh").post(refreshAccessToken)
userRouter.route("/logout").post(verifyJWT,logOutUser)
userRouter.route("/current-user").get(verifyJWT, getCurrentUser)

export default userRouter
