import Express from "express";
import cors from 'cors'
import cookieParser from "cookie-parser";

const app = Express();

app.use(cors({
  origin : process.env.CORS_ORIGIN,
  credentials: true
}))

app.use(Express.json({limit: "16kb"}))
app.use(Express.urlencoded({extended: true, limit: "16kb"}))
app.use(Express.static("public"))
app.use(cookieParser())




// router imports
import userRouter from "./routes/user.router.js"


// router decleration
app.use("/api/v1/users", userRouter)


export default app