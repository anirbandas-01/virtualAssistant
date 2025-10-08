import express from "express";
import { askToAssistant, getCurrentUser, getWeather } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { updateAssistant } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getUserHistory } from "../controllers/user.controller.js";


const userRouter = express.Router()
 

userRouter.route("/current").get(verifyJWT,getCurrentUser);
userRouter.route("/update").post(verifyJWT,upload.single("assistantImage"),updateAssistant);
userRouter.route("/asktoassistant").post(verifyJWT,askToAssistant);
userRouter.route("/history").get(verifyJWT,getUserHistory);
userRouter.route("/weather").get(verifyJWT,getWeather);


export default userRouter ;
