import validator from 'validator';
import mongoose from 'mongoose'
import slugify from 'slugify'
// import User from './userModel.js'
const tourSchema=new mongoose.Schema(
    {
        name: {
            type:String,
            required:[true,"A tour must have a name"],
            unique:true,
            trim:true,
            maxlength:[40,"A name must have less than 40 characters"],
            minlength:[10,"A name must have more than 10 characters"],
            // validate: [validator.isAlpha,'name must be only characters']
        },
        slug:String,
        duration:{
            type:Number,
            required:[true,'A tour must have a duration']
        },
        maxGroupSize:{
            type:Number,
            required:[true,"A tour must have a groupsize"]
        },
        difficulty:{
            type:String,
            required:[true,"A tour must have a difficulty"],
            enum:{
                values:['easy','medium','difficult'],
                message:'difficulty not correct'
            }
        },
        ratingsAverage: {
            type:Number,
            default:4.5,
            min:[1,'Rating must be more than 1'],
            max:[5,'Rating must be less than 5'],
            set:val=>Math.round(val*10)/10 // 4.666=>46.66=>47=>4.7
        },
        ratingsQuantity:{
            type:Number,
            default:0
        },
        price:{
            type:Number,
            required:[true,"A tour must have a price"]
        },
        priceDiscount:{
            type:Number,
            validate:{
                validator:function(val){
                    // this only points to current doc
                    //    on NEW document creation
                    return val < this.price;
                },
                message:'Discount price ({VALUE}) should be less than the price'
            }
        },
        summary:{
            type:String,
            trim:true,
            required:[true,"A tour must have a summary"]
        },
        description:{
            type:String,
            trim:true
        },
        imageCover:{
            type:String,
            trim:true,
            required:[true,"A tour must have image cover"]
        },
        images:[String],
        createdAt:{
            type:Date,
            default:Date.now(),
            select:false
        },
        startDates:[Date],
        secretTour:{
            type:Boolean,
            default:false
        },
        startLocation:{
            // GeoJSON
            type:{
                type:String,
                default:'Point',
                enum:['Point']
            },
            coordinates:{
                type:Number
            },
            address:String,
            description:String
        },
        locations:[
            {
                type:{
                    type:String,
                    default:'Point',
                    enum: ['Point']
                },
                coordinates:[Number],
                address:String,
                description:String,
                day:Number
            }
        ],
        guides:[
            {
                type:mongoose.Schema.ObjectId,
                ref:'User'
            }
        ]
    },
    {
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
)

// -1 for desc and 1 for asc
// tourSchema.index({price:1});
tourSchema.index({price:1,ratingsAverage:-1});
tourSchema.index({slug:1});
tourSchema.index({startLocation:'2dsphere'});

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration/7;
});

// Virtual populate
tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField: 'tour',
    localField:'_id'
})

// DOCUMENT MIDDLEWARE: runs before .create() and .save()
tourSchema.pre('save',function(next){
    this.slug=slugify(this.name,{lower:true});
    next();
});

// turn id to a whole user
// tourSchema.pre('save',async function(next){
//     const guidesPromises=this.guides.map(
           // need to import User
//         async id=> await User.findById(id)
//     );
//     this.guides=await Promise.all(guidesPromises);
    
//     next();
// })

// tourSchema.pre('save',function(next){
//     console.log('Will save Docs');
//     next();
// });

// tourSchema.post('save',function(docs,next){
//     console.log(docs);
//     next();
// });


// QUERY MIDDLEWARE
tourSchema.pre(/^find/,function(next){
    // tourSchema.pre('find',function(next){
    // tourSchema.pre('findOne',function(next){
    this.find({secretTour:{$ne:true}});
    this.start=Date.now();
    next();
});

tourSchema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:'-__v -passwordCangedAt -passwordResetExpires -passwordResetToken'
    }); 
    next();
});

tourSchema.post(/^find/,function(docs,next){
    console.log(`Query Took ${Date.now()-this.start} milliseconds`)
    //console.log(docs);
    next();
});

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({
//         $match:{secretTour:{$ne:true}}
//     });
//     console.log(this.pipeline());
//     next();
// });

const Tour=mongoose.model('Tour',tourSchema);

export default Tour;