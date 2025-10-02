import express from "express";
import { getCurrentUser } from "../controllers/auth.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const userRouter = express.Router()
 

userRouter.route("/current").get(verifyJWT,getCurrentUser)


export default userRouter
