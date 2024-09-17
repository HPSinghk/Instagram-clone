import express from  'express';
import { editProfile, followOrUnfollow, getProfile, getSuggestedUser, login, logout, register } from '../controllers/user.controller.js';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import {upload} from '../middlewares/multer.js';

const router = express.Router();

router.route('/register').post(
    upload.none(),
    register
);
router.route('/login').post(
    upload.none(),
    login
);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuthenticated, getProfile);
router.route('/profile/edit').post(
    isAuthenticated,
    upload.single('profilePicture'),
    editProfile
);
router.route('/suggested').get(isAuthenticated, getSuggestedUser);
router.route('/followorunfollow/:id').post(isAuthenticated, followOrUnfollow);

export default router;
