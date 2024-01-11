import dotenv from "dotenv"


import connectDb from "./db/index.js";

dotenv.config({
    path: "./env"
})

connectDb()






















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