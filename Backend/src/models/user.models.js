import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({
    port:"./.env"
});


const userSchema = new mongoose.Schema(
    {
        fullName:{
            type: String,
            required: true,
            trim: true,
            index: true
        },
        userName:{
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        email:{
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        password:{
            type: String,
            required: [true, 'password is required' ]
        },
        assistantName: {
             type: String,
             required: true        
        },
        assistantImage: {
            type: String
        },
        history:[
            {type:String}
        ],
        refreshToken:{
            type: String
        }
    },{timestamps: true}
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)

}

userSchema.methods.generateAccessToken = function(){
    if(!process.env.ACCESS_TOKEN_SECRET){
        throw new Error("Access token secret is missing in .env");
    }
     return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
     )
}


userSchema.methods.generateRefreshToken = async function () {
    if(!process.env.REFRESH_TOKEN_SECRET){
        throw new Error("Refresh token secret is missing in .env");
    }
     return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
     )
}
const User = mongoose.model("User", userSchema)

export default User
