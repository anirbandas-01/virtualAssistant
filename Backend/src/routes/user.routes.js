import express from "express";
import { signUp, loginUser, logOutUser } from "../controllers/auth.controllers.js";

const userRouter = express.Router()
 
userRouter.post("/signup", signUp)
userRouter.post("/signin", loginUser)
userRouter.get("/logout", logOutUser)


export default userRouter