import { User } from "../models/user.model.js";
import { apiErrors } from "../utils/apiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler( async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new apiErrors(401, "Unauthorized request")
        }
    
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken");
    
        if(!user){
            throw new apiErrors(401, "Invalid access token")
        }
    
        req.user = user;
    
        next();
    } catch (error) {
        throw new apiErrors(401, error?.message || "Invalid access token")
    }

})