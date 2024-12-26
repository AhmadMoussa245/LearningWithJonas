import User from "./../models/userModel.js";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";
import factory from './handlerFactory.js';


const filterObj=(obj,...allowedFields)=>{
    const newObj={};
    Object.keys(obj).forEach(el=>{
        if(allowedFields.includes(el)){
            newObj[el]=obj[el];
        };
    });
    return newObj;
};

const getMe=(req,res,next)=>{
    req.params.id=req.user.id;
    next();
}

const updateMe=catchAsync(async(req,res,next)=>{
    // 1) Create error if user POSTs pssword data
    if(req.body.password || req.body.passowrdConfirm){
        return next(new AppError(
            'This route is not for password update',400
        ))
    }
    
    // 2) Filtered the body to not edit sensetive info
    const filteredBody=filterObj(req.body,'name','email');
    
    // 2) Update user document
    const updatedUser=await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
            new:true,
            runValidators:true
        }
    );
    res.status(200).json({
        status:'success',
        data:{
            updatedUser
        }
    })
})

const deleteMe=catchAsync(async(req,res)=>{
    await User.findByIdAndUpdate(req.user.id,{active:false})
    res.status(204).json({
        status:'succes',
        data:null
    })
})

// we dont need postUser because we have signup
const postUser=(req,res)=>{
    res.status(500).json({
        status:'fail',
        message:'This route is not defined, Please use /signup instead'
    })
};

const getAllUsers=factory.getAll(User);
const getUsersById=factory.getOne(User);
// Do NOT update passwords with this
const patchUser=factory.patchOne(User);
const deleteUser=factory.deleteOne(User);

export default{
    getAllUsers,
    getMe,
    updateMe,
    deleteMe,
    postUser,
    getUsersById,
    patchUser,
    deleteUser
}