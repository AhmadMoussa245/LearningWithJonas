import User from "./../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";

const getAllUsers=catchAsync(async(req,res)=>{
    const users=await User.find()
    res.status(200).json({
        status:'success',
        results:users.length,
        data:{
            users
        }
    });
})

const postUser=(req,res)=>{
    res.status(404).json({
        status:'failed',
        message:'not implemented'
    });
}

const getUsersById=(req,res)=>{
    res.status(404).json({
        status:'failed',
        message:'not implemented'
    });
}

const patchUser=(req,res)=>{
    res.status(404).json({
        status:'failed',
        message:'not implemented'
    });
}

const deleteUser=(req,res)=>{
    res.status(404).json({
        status:'failed',
        message:'not implemented'
    });
}

export default{
    getAllUsers,
    postUser,
    getUsersById,
    patchUser,
    deleteUser
}