import dotenv from "dotenv"


import connectDb from "./db/index.js";
import app from "./App.js";

dotenv.config({
    path: "./env"
})

connectDb()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MongoDB connection error", error);
})






















// import mongoose from "mongoose";
// import {DB_NAME} from './Constants'

// ;( async ()=>{

//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     } catch (error) {
//         console.error("Error", error)
//         throw error
//     }
// })()