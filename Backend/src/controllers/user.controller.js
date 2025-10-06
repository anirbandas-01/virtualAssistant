import { response } from "express";
import geminiResponse from "../gemini.js";
import User  from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
    try {
        
        const userId = req.user._id
        const user = await User.findById(userId).select("-password -refreshToken")

        if(!user){
            return res.status(400).json({message: "user not found"})
        }
        return res.status(200).json(user)

    } catch (error) {
           return res.status(400).json({message: "get current user error"})   
    }
}


export const updateAssistant = async (req, res) => {
    try {
        console.log("req.body:", req.body);
        console.log("req.file:", req.file);

        const {assistantName, imageUrl} = req.body
        let assistantImage;

        if(req.file){
            assistantImage = await uploadOnCloudinary(req.file.path);
        }else{
            assistantImage = imageUrl;
        }

        if(!assistantName || !assistantImage){
            return res.status(400).json({message: "Assistant name or image missing"})
        }

        const user = await  User.findByIdAndUpdate(req.user._id,{assistantName, assistantImage},{new:true}).select("-password -refreshToken")
        
        return res
        .status(200)
        .json(user)

    } catch (error) {
       console.log("Update error:", error);
       return res.status(400).json({ message: error.message });
    }
};


export const askToAssistant = async (req, res)=> {
    try {
        const {prompt}= req.body
        const user = await User.findById(req.user._id);
        const userName = user.fullName;
        const assistantName = user.assistantName;
        const result = await geminiResponse(prompt, assistantName, userName);   
        
        const jsonMatch= result.trim().match(/{[\s\S]*}/);
        if(!jsonMatch){
             console.log("❌ Could not parse Gemini JSON:", result);
            return res.status(400).json({response:"sorry, i can't understand"});
        }
        
        const gemResult = JSON.parse(jsonMatch[0]);
        const type= gemResult.type

        switch(type){
            case 'get_date' :
                 return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Today's date is ${moment().format("YYYY-MM-DD")}`
                 });
                 case 'get_time' :
                 return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `The current time is ${moment().format("h:mm A")}`
                 });
                 case 'get_day' :
                 return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Today is ${moment().format("dddd")}`
                 });
                 case 'get_month' :
                 return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `We are in ${moment().format("MMMM")}`
                 });
                 case 'google_search':
                 case 'youtube_search':
                 case 'youtube_play':
                 case 'settings_open':
                 case 'music_open':
                 case 'camera_open':
                 case 'notes_open':
                 case 'whatsapp_open':
                 case 'gmail_open':
                 case 'facebook_open':
                 case 'instagram_open':
                 case 'calculator_open':
                    return res.json({
                        type,
                        userInput: gemResult.userInput,
                        response:gemResult.response,
                    });
                                            
                    default:
                        return res
                        .status(400)
                        .json({response: "I did't understand that command."})
        }  
    } catch (error) {
        return res.status(500).json({response: "ask assistant error."})   
    }
}