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
        const { prompt } = req.body;
        if(!prompt) return res.status(400).json({ response: "No prompt provided." });
        
        const user = await User.findById(req.user._id);
        if(!user) return res.status(400).json({ response: "user not found." });

        const userName = user.fullName;
        const assistantName = user.assistantName;

        //STEP1-call gemini api
        const result = await geminiResponse(prompt, assistantName, userName);   
        
        //step2- extract only json if extra text exists
       const jsonMatch= result.trim().match(/{[\s\S]*}/);
        if(!jsonMatch){
             console.log("❌ Could not parse Gemini JSON:", result);
             return res.status(400).json({response:"sorry, i can't understand"});
        }
        
        //step3: parse safely
        let gemResult;
        try {
            gemResult = JSON.parse(jsonMatch[0]);
            
        } catch (e) {
            console.log("Gemini parse error:", e.message);
            return res.status(400).json({ response: "Invalid response from Gemini." });
        }

        const { type, userInput, response: responseText }= gemResult;

        user.history.push(`🧑${prompt}`);
        user.history.push(`🤖${responseText || "No response"}`);
        await user.save()
        
        //step4:- Handel known command types
        switch(type){
            case "get_date":
                 return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: `Today's date is ${moment().format("YYYY-MM-DD")}`
                 });
                 case "get_time":
                     return res.json({
                     type,
                     userInput: gemResult.userInput,
                     response: `The current time is ${moment().format("h:mm A")}`
                 });
                 case "get_day":
                     return res.json({
                     type,
                     userInput: gemResult.userInput,
                     response: `Today is ${moment().format("dddd")}`
                 });
                 case "get_month":
                     return res.json({
                     type,
                     userInput: gemResult.userInput,
                     response: `We are in ${moment().format("MMMM")}`
                 });
                 case "greeting":
                        return res.json({
                            type,
                            userInput,
                            response: `Hey ${userName}! I’m ${assistantName}. Hope you’re having a great day!`
                        });

                 case "how_are_you":
                        return res.json({
                            type,
                            userInput,
                            response: `I’m doing great, ${userName}. Thanks for asking! How about you?`
                        });

                 case "thank_you":
                        return res.json({
                            type,
                            userInput,
                            response: `You’re always welcome, ${userName}!`
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
                        userInput,
                        response:responseText || "Opening requested app...",
                    });
                                            
                    default:
                        return res
                        .status(400)
                        .json({response: "I did't understand that command."});
        }  
    } catch (error) {
        console.log("askToAssistant error:", error);
        return res.status(500).json({ response: "ask assistant error." })   
    }
};

export const getUserHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if(!user) return res.status(400).json({ response: "User not found." });

        res.status(200).json({ history: user.history });
    } catch (error) {
        console.log("getUserHistory error:", error);
        res.status(500).json({ response: "Error fetching history." });
    }
};