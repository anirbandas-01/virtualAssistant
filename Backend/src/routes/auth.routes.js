import express from "express";
import { signUp, loginUser, logOutUser, getCurrentUser, refreshAccessToken } from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const authRouter = express.Router()
 
authRouter.route("/signup").post(signUp)
authRouter.route("/login").post(loginUser)
authRouter.route("/refresh").post(refreshAccessToken)
authRouter.route("/logout").post(verifyJWT,logOutUser)
authRouter.route("/current-user").get(verifyJWT, getCurrentUser)

export default authRouter
