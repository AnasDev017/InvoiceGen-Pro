import express from "express";
import { configDotenv } from "dotenv";
import connentDB from "./config/db.js";
import cors from 'cors'
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
configDotenv()

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
   origin: true, 
   credentials: true 
}))
app.use('/auth',authRoutes)

connentDB()
app.listen(process.env.PORT,()=>{
   console.log("SERVER IS RUNNING!");
})