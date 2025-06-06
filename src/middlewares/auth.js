import { asyncHandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");

        console.log("Token:", token);

        if (!token) {
            return res.status(401).json({ message: "Access token is required" });
        }

        const decodedinfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log("Decoded Info:", decodedinfo._id);
        
    const user = await User.findById(decodedinfo._id).select("-password -refreshToken");
        console.log("User:", user);

        if (!user) {
            throw new ApiError(401, "Unauthorized access");
        }

        req.user = user;
        next();
    } catch (err) {
        throw new ApiError(401, "Unauthorized access", err.message);
    }
});
