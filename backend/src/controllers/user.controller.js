import { User } from "../models/user.model.js"
import { Post }  from "../models/post.model.js"

import bcrypt from  "bcryptjs";
import jwt from  "jsonwebtoken";
import uploadOnCloudinary from "../utils/cloudinary.js";
import path  from "path";



export const register = async(req, res) =>{
    try {
        const {username, email,  password} = req.body;
        if(!username || !email ||  !password){
            return res.status(401).json({
                message:"Something is missing please check!",
                success: false
            })
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(401).json({
                message:"Try different email",
                success: false
            })
        }
        const hashedPassword = await bcrypt.hash(password,10); 
        await User.create({
            username,
            email,
            password: hashedPassword
        });
        return res.status(201).json({
            message:"Account created successfully",
            success: true
        })
    } catch (error) {
        console.log(error)
    }
}

export const login = async(req, res) => {
    try {
        const {email, password, username} = req.body;

        if(!username && !email){
            return res.status(401).json({
                message:"Something is missing please check!",
                success: false
            })
        }
        let user = await  User.findOne({email});
        if(!user){
            return res.status(401).json({
                message:"Incorrect email or password",
                success: false
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(401).json({
                message:"Incorrect email or password",
                success: false
            })
        }

        const token = jwt.sign(
            {userId:user._id},
            process.env.SECRET_KEY,
            {expiresIn:'1d'}
        )

        const populatePosts = await Promise.all(
            user.posts.map( async(postId) => {
               const post = await Post.findById(postId);
               if(post.author.equals(user._id)){
                return post;
               }
               return null
            })
        )
        user = {
            _id:user._id,
            username:user.username,
            email:user.email,
            profilePicture: user.profilePicture,
            bio:user.bio,
            followers:user.followers,
            followings:user.followings,
            posts:populatePosts
        }
        
        return res
        .cookie('token', token, {httpOnly:true,sameSite:'strict', maxAge:1*24*60*60*1000})
        .json({
            message:`welcome back ${user.username}`,
            success: true,
            user
        })
    } catch (error) {
        console.log(error)
    }
}
 
export const logout = async(_,res) =>{
    try {
        return res
        .cookie("token","", {maxAge:0})
        .json({
            message:"logged out successfully",
            success: true
        })
    } catch (error) {
        console.log(error)
        
    }
}

export const getProfile = async(req, res) =>{
    try {
        const userId = req.params.id;
        let user = await User.findById(userId).select("-password");
        return res
        .status(200)
        .json({
            user,
            success: true
        })
    } catch (error) {
        console.log(error)
        
    }
}

export const editProfile = async(req, res) =>{
    try {
        const userId = req.id;
        const {bio, gender} = req.body;
        console.log(bio)
        console.log(gender)
        let profilePicture;
        if(req.file &&  req.file.path){
            profilePicture = req.file.path
        }

        let cloudResponse = await uploadOnCloudinary(profilePicture);
        const  user = await User.findById(userId).select("-password");

        if(bio){
            user.bio = bio
        }
        if(gender){
            user.gender = gender
        }
        if(cloudResponse){
            user.profilePicture = cloudResponse.secure_url
        }

        await user.save();
        return res
        .status(200)
        .json({
            message:"Profile updated",
            success:true
        })


    } catch (error) {
        console.log(error)
    }
}

export const getSuggestedUser = async(req, res) => {
    try {
        const suggestedUser = await User.find({_id:{$ne:req.id}}).select("-password");
        if(!suggestedUser){
            return res
            .status(400)
            .json({
                message:"No user found",
            })
        }
        return res
        .status(200)
        .json({
            success: true,
            users:  suggestedUser

        })
    } catch (error) {
        console.log(error)
    }
}

export const followOrUnfollow = async(req, res) =>{
    try {
        const followKrneWala = req.id //haredra
        const jiskoFollowKrunga = req.params.id; //shivani
        if(followKrneWala === jiskoFollowKrunga){
            return res
            .status(400)
            .json({
                message :"You can't follow yourself",
                success :false
            })
        }
        const user = await User.findById(followKrneWala);
        const targetUser = await  User.findById(jiskoFollowKrunga);

        if(!user || !targetUser){
            return res
            .status(400)
            .json({
                message :"User not found", 
                success :false
            })
        }
        // main check krunga follow krna hai ki unfollow
        const isFollowing = user.followings.includes(jiskoFollowKrunga);
        if(isFollowing){
            // unfollow krna hai
            await Promise.all([
                User.updateOne({_id:followKrneWala},{$pull:{followings:jiskoFollowKrunga}}),
                User.updateOne({_id:jiskoFollowKrunga},{$pull:{followers:followKrneWala}}),
            ])
            return res
            .status(200)
            .json({
                message :"Unfollowed successfully",
                success :true
            })
        }else{
            // follow krna hai
            await Promise.all([
                User.updateOne({_id:followKrneWala},{$push:{followings:jiskoFollowKrunga}}),
                User.updateOne({_id:jiskoFollowKrunga},{$push:{followers:followKrneWala}}),
            ])
            return res
            .status(200)
            .json({
                message :"followed successfully",
                success :true
            })
        }
    } catch (error) {
        console.log(error)
        
    }
}
