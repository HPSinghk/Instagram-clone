import uploadOnCloudinary from "../utils/cloudinary.js";
import {User} from  "../models/user.model.js";
import  {Post} from "../models/post.model.js";
import { Comment } from "../models/comment.model.js";

export const addNewPost = async(req, res) => {
    try {
        const { caption } = req.body;
        let  image;
        if(req.file && req.file.path){
           image = req.file.path;
        }
        const authorId = req.id;
        if(!image){
            return res
            .status(400)
            .json({ message: "Please add an image" });
        }
        //image upload
        const img = await uploadOnCloudinary(image);
        const post = await Post.create({
            caption,
            image: img.secure_url,
            author: authorId,
        })
        const user = await User.findById(authorId);
        if(user){
            user.posts.push(post._id);
            await user.save();
        }
        await post.populate({path:'author', select:"-password"})
        return res
        .status(201)
        .json({
             message: "New post added",
             post,
             success: true
            });

    } catch (error) {
        console.log(error)
        
    }
}

export const getAllPost = async(req, res) => {
    try {
        const posts = await Post.find().sort({createdAt:-1})
        .populate({
            path:'author',
            select:"username, profilePicture"
        })
        .populate({
            path:"comments",
            sort:{createdAt:-1},
            populate:{
                path:"author",
                select:"username, profilePicture"
            }
        });
        return res
        .status(200)
        .json({
            posts,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const getUserPost = async(req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({author:authorId})
        .sort({createdAt:-1})
        .populate({
            path:"comments",
            sort:{createdAt:-1},
            populate:{
                path:"author",
                select:"username, profilePicture"
            }
        })
        return res
        .status(200)
        .json({
            posts,
            success: true
        })

    } catch (error) {
        console.log(error)
    }
}

export const likePost = async(req, res) => {
    try {
        const userWantLike = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if(!post) {
            return res
            .status(404)
            .json({ 
                message: "Post not found",
                success: false
             });   
        }
            await post.updateOne({
                $addToSet:{
                    likes: userWantLike
                }
            })
            await post.save();
            // implement socket io for real time notification

            return  res
            .status(200)
            .json({
                message: "Post liked successfully",
                success: true
            })


    } catch (error) {
        console.log(error)
    }
}
export const dislikePost = async(req, res) => {
    try {
        const userWantdisLike = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if(!post) {
            return res
            .status(404)
            .json({ 
                message: "Post not found",
                success: false
             });   
        }
            await post.updateOne({
                $pull:{
                    likes: userWantdisLike
                }
            })
            await  post.save();
            // implement socket io for real time notification

            return  res
            .status(200)
            .json({
                message: "Post disliked",
                success: true
            })


    } catch (error) {
        console.log(error)
    }
}

export const addComment = async(req, res) =>{
    try {
        const {text}  =  req.body;
        const  userWantAddComment = req.id;
        const postId = req.params.id;
        /* console.log(text) */
        const post = await Post.findById(postId);
        if(!post) {
            return res
            .status(404)
            .json({
                message: "Post not found",  
                success: false
            })
        }
        if(! text) {
            return res
            .status(400)
            .json({
                message: "Please enter a comment",
                success: false
            })
        }
        if(!userWantAddComment){
            return res
            .status(401)
            .json({
                message: "Please login to add a comment"
            })
        }
        const comment = await Comment.create({
            text,
            author:  userWantAddComment,
            post: postId,
            success:  true,
        })
        comment.populate({
            path: 'author',
            select: 'username, profilePicture'
        })
        post.comments.push(comment._id);
        await post.save();

        return res
        .status(201)
        .json({
             message: "Comment added",
             comment,
             success: true
        })
        
    } catch (error) {
        console.log(error)
        
    }
}

export const getCommentsOfPost = async(req, res) => {
    try {
        const  postId  = req.params.id;
        const comment =  await Comment
        .find({ post: postId })
        .populate({
            path: 'author',
            select: 'username, profilePicture'
        })
        if(!comment){
            return res
            .status(404)
            .json({
                message: "No comments found for his post",
                success:  false
            })
        }
        return res
        .status(200)
        .json({
            comment,
            success: true
        })

    } catch (error) {
        
    }
}

export const deletePost = async(req, res) => {
    try {
        const postId  = req.params.id;
        const authorId = req.id;

        const post  = await Post.findById(postId);
        if(!post){
            return res
            .status(404)
            .json({
                message: "Post not found",
                success: false
            })
        }
        // check if the looged in user is owner of post
        if(post.author.toString() !== authorId){
            return res
            .status(403)
            .json({
                message: "anauthorized",
                success: false
            })
        }
        // delete post
        await Post.findByIdAndDelete(postId);
        
        // remove the postid from user's post

        let user = await  User.findById(authorId);
        user.posts = user.posts.filter(id => id.toString() !== postId.toString());
        await user.save();

        // delete associated comments
        await  Comment.deleteMany({post : postId});

        return res
        .status(200)
        .json({
            message: "Post deleted successfully",
            success: true
        })

    } catch (error) {
        console.log(error);
    }
}

export const bookmarkPost = async(req, res) => {
    try {
        const postId =  req.params.id;
        const authorId = req.id;
        const post =  await Post.findById(postId);
        if(!post){
            return res
            .status(404)
            .json({
                message: "Post not found",
                success: false
            })
        }

        const user = await  User.findById(authorId);
        if(user.bookmarks.includes(  postId)){
            // already bookmark ->> remove from bookmark
            await  user.updateOne({$pull: { bookmarks: postId }});
            await user.save()
            return res
            .status(200)
            .json({
                type:"unsaved",
                message: "Post removed from bookmarks",
                success : true
            })
        }else{
            // add to bookmark
            await  user.updateOne({$addToSet: { bookmarks: postId }});
            await user.save()
            return res
            .status(200)
            .json({
                type:"saved",
                message: "Post bookmarked",
                success : true
            })
        }

    } catch (error) {
        console.log(error)
    }
}