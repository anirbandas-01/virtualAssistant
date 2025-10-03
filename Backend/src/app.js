import express from "express";
import cors from "cors";
import cookieParser  from "cookie-parser";

//routes import
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";

const app = express()

//middleware
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())




//router declaration
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", userRouter)


// ✅ Global error handler (must be after routes)
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});


export { app } 