import dotenv from "dotenv";
import  connectDB  from "mongoose";
import { app } from "./app.js";


dotenv.config()({
    Path: "./.env"
})



connectDB()
.then( ()=> {
    app.listen(process.env.PORT || 9090, ()=> {
        console.log(`server is running at port: ${process.env.PORT}`);
        
    })
})
.catch((error) =>{
    console.log("MONGODB db connection failed !!!", error);
    
})