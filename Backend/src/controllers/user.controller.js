import User  from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js"
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