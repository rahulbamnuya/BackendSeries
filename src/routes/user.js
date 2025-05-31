import {Router} from 'express';
import {loginUser, logoutUser, registeruser,refreshAccessToken} from '../controllers/user.js';
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
export default router;