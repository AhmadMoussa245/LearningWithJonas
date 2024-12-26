import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {promisify} from 'util';
import User from '../models/userModel.js';
import sendEmail from '../utils/email.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

const signToken=id=>{
    return jwt.sign(
        {id},
        process.env.JWT_SECRET,
        {expiresIn:process.env.JWT_EXPIRE}
    );
};

const createSendToken=(user,statusCode,res)=>{
    const token=signToken(user._id);
    const cookieOptions={
        expires:new Date(
            Date.now()+
            process.env.JWT_COOKIE_EXPIRES_IN*
            24*60*60*1000  
        ),
        // https : true only in production
        secure:false,
        // important:don't let cookie access or
        //   modified from browser in any way
        httpOnly:true
    };
    if(process.env.NODE_ENV==='production'){
        cookieOptions.secure=true;
    };
    res.cookie('jwt',token,cookieOptions);
    // remove password from out put
    // dont do user.save() and it wont be saved
    user.password=undefined;
    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    });
}

const signup=catchAsync(async (req,res,next)=>{
        const newUser= await User.create({
            name:req.body.name,
            email:req.body.email,
            role:req.body.role,
            password:req.body.password,
            passwordConfirm:req.body.passwordConfirm,
            passwordChangedAt:req.body.passwordChangedAt

        });
        createSendToken(newUser,201,res);
        // const token=signToken(newUser._id)
        // res.status(201).json({
        //     status:'success',
        //     token,
        //     data:{
        //         user: newUser
        //     }
        // });
});

const login=catchAsync(async(req,res,next)=>{
    const {email,password}=req.body;

    // Check if email and password exist
    if(!email || !password){
        return next(new AppError(
            'Please enter email and password',400)
        );
    };

    // Check if user exist and password is correct
    const user=await User.findOne({email})
    .select('+password');
    // if everything is ok , send a token
    if(!user || !(await user.correctPassword(
        password,user.password
    ))){
        return next(new AppError(
            'Incorrect email or password',401)
        );
    };
    createSendToken(user,200,res);
    // const token=signToken(user._id);
    // res.status(200).json({
    //     status:'success',
    //     token
    // });
    
    // dont next after sending response 
    // next();
});

const protect=catchAsync(async(req,res,next)=>{
    
    //getting token and check if it exist
    let token;
    if(req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')){
        token=req.headers.authorization
        .split(' ')[1];
    }
    if(!token){
        return next(new AppError(
            "you aren't loggend in",401)
        );
    }
    
    //Verification : validate the token
    let decoded;
    decoded=await promisify(jwt.verify)(token,process.env.JWT_SECRET)
    
    //check if user still exist
    const currentUser=await User.findById(decoded.id);
    if(!currentUser){
        return next(new AppError(
            'user of this token no longer exist',401)
        );
    };
    
    // check if user changed password after
    //          token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)){
        return next(new AppError(
            'user changed password',401)
        );
    };

    // Grant access to protected route
    req.user=currentUser;
    next();
});

const restrictTo=(...roles)=>{
    return (req,res,next)=>{
        // roles ['admin','lead-guide']. role='user'
        if(!roles.includes(req.user.role)){
            return next(new AppError(
                'You do not have permession',403
            ));
        };
        next();
    };
};

const forgotPassword=catchAsync(async(req,res,next)=>{
    // Get user based on POSTed email
    const user=await User.findOne({email:req.body.email});
    if(!user){
        return next(new AppError(
            'user not found',404
        ));
    };
    
    // Generate the random token
    const resetToken=user.createPasswordResetToken();
    await user.save({validateBeforeSave:false});
    
    // Send it to user's email
    const resetURL=`${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message=`Forgot Your password? Submit patch req with pass and pass confirm to ${resetURL}\nIf you didn't forget your password ignore this email`
    try{
        await sendEmail({
            email:req.body.email,
            subject:'Password reset valid for 10 min',
            message
        })
        res.status(200).json({
            status:'success',
            message:'Token sent to email'
        })
    }catch(err){
        user.PasswordResetToken=undefined;
        user.PasswordResetExpires=undefined;
        await user.save({validateBeforeSave:false});
        return next(new AppError(
            'error sending email. Try again',500
        ))
    }
});

const resetPassword=catchAsync(async(req,res,next)=>{
    // 1) get user based on the token
    const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
    // console.log('Token Received in Request:', req.params.token);
    // console.log('Hashed Token Received:', hashedToken);
    const user=await User.findOne({
        passwordResetToken:hashedToken,
        passwordResetExpires:{$gt:Date.now()}
    });
    // 2) if token has not expired and there is a user
    //             set a new password
    if(!user){
        return next(new AppError(
            'token Invalid or expired',400
        ));
    };
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;
    user.PasswordResetToken=undefined;
    user.PasswordResetExpires=undefined;
    await user.save();
    // 3) update changedPasswordAt property
    //user.passwordChangedAt=Date.now();

    // 4) log the user in, send JWT
    createSendToken(user,200,res);
    // const token=signToken(user._id);
    // res.status(200).json({
    //     status:'success',
    //     token
    // })
});

const updatePassword=catchAsync(async(req,res,next)=>{
    // 1) Get user from collection
    const user=await User.findById(req.user.id)
    .select('+password');
    // 2) Check if POSTed current password is correct
    if(!(await user.correctPassword(
            req.body.passwordCurrent,user.password
    ))){
        return next(new AppError(
            'wrong password',401
        ))
    }

    
    // 3) If so, update password
    user.password=req.body.password;
    user.passwordConfirm=req.body.passwordConfirm;

    await user.save();
    // User.findByIdAndUpdate will NOT work as intended
    
    // 4) Log user in, send JWT
    createSendToken(user,200,res);
    // const token=signToken(user._id);
    // res.status(200).json({
    //     status:'success',
    //     token
    // })
})

export default {
    signup,
    login,
    protect,
    restrictTo,
    forgotPassword,
    resetPassword,
    updatePassword
};
