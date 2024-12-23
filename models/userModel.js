import validator from 'validator';
import mongoose from "mongoose";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema=mongoose.Schema({
    name:{
        type:String,
        required:[true,'A user must have a name']
    },
    email:{
        type:String,
        required:[true,'A user must have an email'],
        unique:true,
        lowercase:true,
        validate:[validator.isEmail,'wrong format']
    },
    photo:{
        type:String
    },
    role:{
        type:String,
        default:'user',
        enum:['user','guide','lead-guide','admin'],
    },
    password:{
        type:String,
        required:[true,'A user must have a password'],
        minlength:8,
        select:false
    },
    passwordConfirm:{
        type:String,
        required:[true,'a user must rewrite the password'],
        validate:{
            // this only worls on create and save!!!
            validator: function(el){
                return el===this.password
            },
            message:'password are not the same'
        }
    },
    passwordChangedAt:Date,
    passwordResetToken:String,
    passwordResetExpires:Date
});

userSchema.pre('save',async function(next){
    // only run if password was modified
    if(this.isModified('password')){
        // hash the password with cost of 12
        this.password = await bcrypt.hash(
            this.password,12
        );
        // delete password confirm field
        this.passwordConfirm=undefined;
    };
    next();
});

userSchema.methods.correctPassword=
async function(cPass,upass){
    return await bcrypt.compare(cPass,upass);
};

userSchema.methods.changedPasswordAfter=
function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp=parseInt(
            this.passwordChangedAt.getTime()/1000,10
        );
        // console.log(changedTimestamp,JWTTimestamp);
        return JWTTimestamp<changedTimestamp;
    };
    return false;
}

userSchema.methods.createPasswordResetToken=
function(){
    const resetToken=crypto
    .randomBytes(32)
    .toString('hex');
    
    this.passwordResetToken=crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
    // console.log('Raw Token:', resetToken);
    // console.log('Hashed Token in DB:', this.passwordResetToken);
    
    this.passwordResetExpires=Date.now()+10*60*1000;

    return resetToken;
};

const User=mongoose.model('User',userSchema);

export default User;