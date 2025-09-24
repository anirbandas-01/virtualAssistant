import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";


export const signUp = async (req,res)=> {
    try {
        
        const { fullName, email, password } = req.body
 
        const existEmail = await User.findOne({email})
        if(existEmail){
            return res
            .status(400)
            .json({message: "email already exists!"})
        }

        if(password.length < 6){
             return res
            .status(400)
            .json({message: "password must be at-least 6 character!"})
        }

        //here we do bcrypt.
        const hashPassword = await bcrypt.hash(password, 15)

        const user = await User.create({
            fullName,password:hashPassword, email
        })

    } catch (error) {
        
    }
}