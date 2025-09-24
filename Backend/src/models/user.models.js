import mongoose, { Types } from "mongoose";

const userSchema = new mongoose.Schema(
    {
        userName:{
            type: String,
            required: true
        },
        email:{
            type: String,
            required: true,
            unique: true
        },
        password:{
            type: String,
            required: true
        },
        assistantName: {
             type: String        
        },
        assistantImage: {
            type: String
        },
        history:[
            {type:String}
        ]
    },{timestamps: true}
)

userSchema.methods.generateAccessToken = function(){
    if(!process.env.ACCESS_TOKEN_SECRET){
        throw new Error("Access token secret is missing in .env");
    }
     return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_SECRET
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
