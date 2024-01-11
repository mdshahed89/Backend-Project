import mongoose from "mongoose";
import { DB_NAME } from "../Constants.js";

async function connectDb(){
    try {
        const connectionInstance =  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n MongDb Connected !! DB Host : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("Error :", error)
        process.exit(1)
    }
}

export default connectDb