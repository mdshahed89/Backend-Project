import { asyncHandler } from "../utils/asyncHandler.js";
import {apiErrors} from "../utils/apiErrors.js"
import { User } from "../models/user.model.js";
import { UploadOnCloudinary } from "../utils/Cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";


const generateRefreshAndAccessToken = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken= refreshToken;
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new apiErrors(500, "something went wrong while generating refresh and access token")
    }
}


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


const loginUser = asyncHandler( async (req, res) => {

    // email or username and password
    // email or password not empty
    // user is registered or not
    // password check
    // access and refresh token generate
    // send cookies
    // send response

    const { email, username, password } = req.body

    if(!username && !email){
        throw new apiErrors(400, "email or username is required")
    }

    const user = await User.findOne({
        $or: [{email}, {username}]
    })

    if(!user){
        throw new apiErrors(404, "User not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new apiErrors(401, "Password is wrong")
    }

    const { accessToken, refreshToken } = await generateRefreshAndAccessToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new apiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken,
            },
            "User logged in successfully"
        )
    )


})



const logoutUser = asyncHandler( async (req, res) => {


    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged out successfully"))

})


export {
    registerUser,
    loginUser,
    logoutUser
}
