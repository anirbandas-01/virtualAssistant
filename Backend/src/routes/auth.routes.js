import express from "express";
import { signUp, loginUser, logOutUser,  refreshAccessToken } from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
//import { getCurrentUser } from "../controllers/user.controller.js";



const authRouter = express.Router()
 
authRouter.route("/signup").post(signUp)
authRouter.route("/login").post(loginUser)
authRouter.route("/refresh").post(refreshAccessToken)
authRouter.route("/logout").post(verifyJWT,logOutUser)
//authRouter.route("/current").get(verifyJWT, getCurrentUser)

export default authRouter
