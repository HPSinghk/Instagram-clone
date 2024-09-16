import express from 'express'
import isAuthenticated from '../middlewares/isAuthenticated.js'
import { upload } from '../middlewares/multer.js'
import { addComment, addNewPost, bookmarkPost, deletePost, dislikePost, getAllPost, getCommentsOfPost, getUserPost, likePost } from '../controllers/post.controller.js'

const  router = express.Router()

router.route('/add-new-post').post(
    isAuthenticated,
    upload.single("image"),
    addNewPost
)
router.route('/get-all-post').get(isAuthenticated,getAllPost)
router.route('/get-user-post').get(isAuthenticated,getUserPost)
router.route('/:id/like-post').get(isAuthenticated,likePost)
router.route('/:id/dislike-post').get(isAuthenticated,dislikePost)
router.route('/:id/add-comment').post(
    isAuthenticated,
    upload.single(),
    addComment
)
router.route('/:id/get-comments').get(isAuthenticated,getCommentsOfPost)
router.route('/:id/delete-post').get(isAuthenticated,deletePost)
router.route('/:id/bookmark-post').get(isAuthenticated,bookmarkPost)


export  default router;


