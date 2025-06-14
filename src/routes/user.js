import {Router} from 'express';
import {loginUser, logoutUser, registeruser,refreshAccessToken,
     changePassword, getCurrentUser, updateAccountDetail,updateUserAvatar,updateUserCoverImgae,getUserChannelProfile,getWatchedHistory} from '../controllers/user.js';
import {upload} from '../middlewares/multer.js';
import { verifyJWT } from '../middlewares/auth.js';
const router= Router();
router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount: 1
    },
    {
        name:"coverImage",
        maxCount: 1
    }
]),registeruser);
router.route("/login").post(loginUser);
//secure routes
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changePassword)
router.route("/currentuser").get(verifyJWT, getCurrentUser);
router.route("/update-detail").
patch(verifyJWT,updateAccountDetail);
router.route("/update-avatar").
patch(verifyJWT,upload.single("avatar"),updateUserAvatar);
router.route("/update-cover-image").
patch(verifyJWT,upload.single("coverImage"),updateUserCoverImgae); 
router.route("/c/:username").get(verifyJWT,getUserChannelProfile);
router.route("/history").get(verifyJWT,getWatchedHistory);


export default router;