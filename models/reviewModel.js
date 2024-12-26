import mongoose from "mongoose";
import Tour from "./tourModel.js";


const reviewSchema=new mongoose.Schema(
    {
        review:{
            type:String,
            required:['true','review is required']
        },
        rating:{
            type:Number,
            min:1,
            max:5
        },
        createdAt:{
            type:Date,
            defaule:Date.now()
        },
        user:{
            type:mongoose.Schema.ObjectId,
            ref:'User',
            required:[true,'review must belong to a user']
        },
        tour:{
            type:mongoose.Schema.ObjectId,
            ref:'Tour',
            required:[true,'review must belong to a tour']
        }
    },
    {
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
);

// dont let user send review twice on the same tour
reviewSchema.index({tour:1,user:1},{unique:true});

reviewSchema.pre(/^find/,function(next){
    // this.populate({
    //     path:'tour',
    //     select:'name'
    // }).populate({
    //     path:'user',
    //     select:'name photo'
    // });

    // dont show other things in user
    this.populate({
        path:'user',
        select:'name photo'
    });
    next();
});

reviewSchema.statics.calcAverageRatings=async function(tourId){
    
    const stats = await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRating:{$sum:1},
                avgRating:{$avg:'$rating'}
            }
        }
    ]);
    console.log(stats);

    if(stats.length){
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:stats[0].nRating,
            ratingAverage:stats[0].avgRating
        });
    }else{
        await Tour.findByIdAndUpdate(tourId,{
            ratingsQuantity:0,
            ratingAverage:4.5
        });
    }
};

reviewSchema.post('save',function(){
    // this points to current review 
    this.constructor.calcAverageRatings(this.tour);
});

reviewSchema.pre(/^findOneAnd/,async function(next){
    this.r = await this.findOne();
    console.log(this.r);
    next();
});

reviewSchema.post(/^findOneAnd/,async function(next){
    // await this.findOne(); does NOT work here
    // because the query has already executed
    await this.r.constructor
    .calcAverageRatings(this.r.tour);
});

const Review=mongoose.model('Review',reviewSchema);

export default Review;

