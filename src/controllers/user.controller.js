import { asyncHandler } from "../utils/asyncHandler.js";
import {apiErrors} from "../utils/apiErrors.js"
import { User } from "../models/user.model.js";
import { UploadOnCloudinary } from "../utils/Cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";


const registerUser = asyncHandler( async (req, res) => {
    // Get user details from frontend
    // validation not empty
    // Check if user already not exist -- username && email
    // Check for images or check for avatar
    // Upload them to cloudinary
    // Create user object and create entry in db
    // Remove password and refresh token from response
    // Check for user creation
    // return res

    const {email, username, fullName, password}=req.body

    // console.log(email, fullName);

    if(
        [email, fullName, username, password].some((field) => field?.trim()==="")
    ){
        throw new apiErrors(400, "All field is required")
    }


    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })
    if(existedUser){
        throw new apiErrors(409, "User already exists")
    }

    const avatarLocalPath =  req.files?.avatar[0]?.path;
    // const coverImageLocalPath =  req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
        coverImageLocalPath = req.files.coverImage[0].path;
    }


    if(!avatarLocalPath){
        throw new apiErrors(400, "Avatar is required")
    }

    const avatar = await UploadOnCloudinary(avatarLocalPath);
    const coverImage = await UploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new apiErrors(400, "Avatar is required")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new apiErrors(500, "Something went wrong when registering the user")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered successfully")
    )

} )

export {registerUser}
