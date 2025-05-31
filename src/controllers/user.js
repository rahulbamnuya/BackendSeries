import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { upload } from "../middlewares/multer.js";
// Generate tokens and save refresh token
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
       
        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating access token:", error);
        throw new ApiError(500, "Internal server error");
    }
};

// REGISTER USER
const registeruser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    if ([fullName, email, username, password].some(field => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User already exists with this username or email");
    }

    const avatarlocalpath = req.files?.avatar?.[0]?.path;
    let coverImagelocalpath;

    if (req.files?.coverImage?.length > 0) {
        coverImagelocalpath = req.files.coverImage[0].path;
    }

    if (!avatarlocalpath) {
        throw new ApiError(400, "Avatar image is required");
    }

    const avatar = await UploadOnCloudinary(avatarlocalpath);
    const coverImage = coverImagelocalpath ? await UploadOnCloudinary(coverImagelocalpath) : null;

    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar image");
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User created successfully")
    );
});

// LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!username && !email) throw new ApiError(400, "Username or email required");
  if (!password) throw new ApiError(400, "Password required");

  // Select password explicitly because of `select: false` in schema
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) throw new ApiError(404, "User not found");

  const isValid = await user.comparePassword(password);
  console.log("Password validation:", isValid);
  if (!isValid) throw new ApiError(401, "Invalid password");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  // Save refreshToken to user document if you want to track or invalidate
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure:true
  
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {
      user: loggedInUser,
      accessToken,
      refreshToken
    }, "User logged in successfully"));
});



// LOGOUT USER
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $unset: { refreshToken: 1 }
    });

    const options = {
        httpOnly: true,
        secure: true
       
    };

    res.clearCookie("refreshToken", options);
    res.clearCookie("accessToken", options);

    return res.status(200).json(
        new ApiResponse(200, null, "User logged out successfully")
    );
});


const  refreshAccessToken=asyncHandler(async (req,res)=>{
    const incomingrefreshtoken=req.cookies.refreshToken || req.body.refreshToken
    if(!incomingrefreshtoken){
        throw new ApiError(401,"unauthorization request")
    }
try{
    const Decodetoken=jwt.verify(incomingrefreshtoken,process.env.REFRESH_TOKEN_SECRET);
const user=await User.findById(Decodetoken._id)
if(!user){
    throw new ApiError(401,"Invalid refresh token")
}
if(incomingrefreshtoken!==user?.refreshToken){
    throw new ApiError(401,"Refresh token expire or used")
}

const options={
    httpOnly:true,
    secure:true
}
const {accessToken,refreshToken }=await generateAccessAndRefreshToken(user._id)
const newrefreshToken=refreshToken  ;
console.log(newrefreshToken)
return res.
status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",newrefreshToken,options)
.json(
    new ApiResponse(200,{
        accessToken,refreshToken:newrefreshToken
    },"Access token refreshed successfully")
)
}catch(error){
    throw new ApiError(401,error?.message || "Invalid refresh token")
}
});


const changePassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;
    //req.user by auth middlewhere we found user info
    const user=await User.findById(req.user?._id)
    const ispasswordCorrect=await user.comparePassword(oldPassword,newPassword)

if(!ispasswordCorrect){
    throw new ApiError(400,"Invalid old Password")
}
user.password=newrefreshToken
    await user.save({validateBeforeSave:false})
return res.status(200).json(new ApiResponse(200,"Passwordchange successfully"))
})

const getCurrentUser=asyncHandler(async(req,res)=>{
    return res.status(200).json(200,req.user,"current user fetch successfull")
})
const updateAccountDetail=asyncHandler(async(req,res)=>{
    const{fullName,email,}=req.body;
    if(!fullName && !email){
        throw new ApiError(400,'All filed required')
    }
    const user=await User.findByIdAndUpdate(
        req.user?._id,{$set:{
            fullName:fullName,
            email:email
        }},{
            new:true
        }).select("-password")
        return res.status(200).json(new ApiResponse(200,user,"Account detail update successfully"))
})
const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarlocalpath=req.file?.path;
    if(!avatarlocalpath){
        throw new ApiError(400,"Avatar file missing")

    }
    const avatar=await UploadOnCloudinary(avatarlocalpath)
    if(!avatar.url){
         throw new ApiError(400,"Error while uploading on cloudinary")
    }
    const user=await User.findByIdAndDelete(req.user._id,{
        $set:{
            avatar:avatar.url
        }
    },{
        new:true
    }).select("-password")
     return res.status(200).json(new ApiResponse(200,user,"Avatar update successfully"))
})
const updateUserCoverImgae=asyncHandler(async(req,res)=>{
    const coverlocalpath=req.file?.path;
    if(!coverlocalpath){
        throw new ApiError(400,"COver file missing")

    }
    const coverImage=await UploadOnCloudinary(coverlocalpath)
    if(!coverImage.url){
         throw new ApiError(400,"Error while uploading on cloudinary")
    }
    const user=await User.findByIdAndDelete(req.user._id,{
        $set:{
            coverImage:coverImage.url
        }
    },{
        new:true
    }).select("-password")
     return res.status(200).json(new ApiResponse(200,user,"Cover Image update successfully"))
})
const getUserChannelProfile=asyncHandler(async(req,res)=>{
    const {username}=req.params;
    if(!username?.trim()){
        throw new ApiError(400,"Username is required")
    }
    const channel=await User.aggregate([
        { 
            $match:{
                username:username.toLowerCase()
            }
        },{
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },{
             $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
        },{
            $addFields:{
                subscriberCount: { 
                    $size: "$subscribers" },
                ChannelsubscribedToCount: {
                     $size: "$subscribedTo" },

                isSubscribed:{
                        $cond:{
                            if:{
                                $in:[req.user?._id,"$subscribers.subscriber"]   
                            },
                            then:true,
                            else:false
                        }
                     }
            }
        },{
            $project:{
                fullName:1,
                username:1,
                avatar:1,
                coverImage:1,
                subscriberCount:1,
                ChannelsubscribedToCount:1,
                email:1,
                isSubscribed:1

            }
        }

    ])
    console.log(channel)
    if(!channel || channel.length===0){
        throw new ApiError(404,"Channel not found")
    }
    return res.status(200).json(
        new ApiResponse(200,channel[0],"Channel profile fetched successfully")
    )
   
})

const getWatchedHistory = asyncHandler(async (req, res) => {
const user=await User.aggregate([
    {
        $match:{
            _id:new mongoose.Types.ObjectId(req.user._id)
        }
    },{
        $lookup:{
            from:"videos",
            localField:"watchHistory",
            foreignField:"_id",
            as:"watchHistory",
            pipeline:[
                {
                    $lookup:{
                        from:"users",
                        localField:"owner",
                        foreignField:"_id",
                        as:"owner",
                        pipeline:[
                            {
                                $project:{
                                    
                                    fullName:1,
                                    username:1,
                                    avatar:1
                                }
                            }
                        ]
                    }
                },{
                    $addFields:{
                        owner:{
                            $first:"$owner"
                        }
                    }
                }
            ]
        }
    }
])
return res.status(200).json(
    new ApiResponse(200,user[0].watchHistory,"Watched history fetched successfully")
)





})









export { registeruser, loginUser, logoutUser,refreshAccessToken ,getCurrentUser,updateAccountDetail,updateUserAvatar,updateUserCoverImgae,changePassword,getUserChannelProfile,getWatchedHistory};
