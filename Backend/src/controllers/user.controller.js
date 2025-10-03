import User  from "../models/user.models.js";

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