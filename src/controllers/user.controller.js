import {asyncHandler} from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken";
import mongoose from "mongoose"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        // console.log("Heere")
        const user = await User.findById(userId);
        // console.log("Heere")
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "something went wrong while generating access and refresh token");
    }
}


const registerUser = asyncHandler( async (req, res) => {
    // get all user data from body
    // validate all required data
    // check if user already exists
    // check for images
    // upload images to cloudinary
    // create user object
    // remove password and refresh token from response
    // check for user creation
    // return response

    const { username, fullName, email, password } = req.body;

    if(
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "all fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser) {
        throw new ApiError(400, "User with email and username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "avatar image is required");
    }

    console.log(avatarLocalPath);

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        avatarPublicId: avatar.public_id,
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser) {
        throw new ApiError(500, "something went wrong when creating a user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    // get email, password from req,body
    // find the user
    // password check
    // access and refresh token 
    // generate token store it in cookie

    const { email, username, password } = req.body;
    
    if(!username && !email) {
        throw new ApiError(500, "Username and email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(401, "invalid user credentials")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) {
        throw new ApiError(401, "invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .cookie("isAdmin", loggedInUser.isAdmin, options)
    .json(new ApiResponse(200, {
        user: loggedInUser,
        accessToken: accessToken,
        refreshToken: refreshToken,
        isAdmin: loggedInUser.isAdmin
    }, 
        "User logged in success"
    ))
       
})

const logoutUser = asyncHandler(async(req, res) => {
    console.log("Here")
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    console.log("Here")

    const options = {
        httpOnly: true,
        secure: true
    }
    console.log("Here")


    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .clearCookie("isAdmin", options)
    .json(new ApiResponse(200, {}, "user logged out"))
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id)

        if(!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {accessToken, refreshToken: newRefreshToken},
        "Access token refreshed"
      )
    )
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
  } 
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req,user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid) {
        throw new ApiError(404, "Invalid old password")
    }

    user.password = newPassword
    
    await user.save({validateBeforeSave: true})

    return res.status(200).json(new ApiResponse(200, {}, "password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res.status(200, req.user, "current user here")
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body

    if(!fullName || !email) {
        throw new ApiError(400, "all fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email: email
            }
        },
        {new: true}
    ).select("-password -refreshToken")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath) {
        throw new ApiError(400, "avatar file missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar) {
        throw new ApiError(400, "error while uploading avatar on cloudinary")
    }

    const oldAvatar = User.findById(req.user?._id).select("-password -refreshToken")

    await deleteOnCloudinary(oldAvatar.avatarPublicId)

    const user = await User.findByIdAndUpdate(req.user?._id, 
        {
            $set: {
                avatar: avatar.url,
                avatarPublicId: avatar.public_id
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "avatar image updated success"))
})

export {registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails}