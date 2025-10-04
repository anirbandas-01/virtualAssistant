import express from "express";
import { getCurrentUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { updateAssistant } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";


const userRouter = express.Router()
 

userRouter.route("/current").get(verifyJWT,getCurrentUser)
userRouter.route("/update").post(verifyJWT,upload.single("assistantImage"),updateAssistant)


export default userRouter
