import Tour from '../models/tourModel.js'
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import APIFeatures from '../utils/apiFeatures.js';


const aliasTopTours=(req,res,next)=>{
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price'
    req.query.fields = 'name,price,ratingAverage,summary,difficulty'
    next()
}


const getAllTours=catchAsync(async(req,res,next)=>{
    //  try{
        //these features moved to apiFeatures.js file
        
        //             FILTERING
        
        // const queryObj={...req.query}
        // const excludedFields=['page','sort','limit','fields']
        // excludedFields.forEach(el=>delete queryObj[el])
        
        
        //           ADVANCED FILTERING
        
        // let queryStr=JSON.stringify(queryObj);
        // queryStr=queryStr.replace(
        //     /\b{lt|gt|lte|lt}\b/g,
        //     match=> `$${match}`
        // )
        // let query=Tour.find(JSON.parse(queryStr))
        


        //                SORTING
        // if(req.query.sort){
        //     const sortBy=req.query.sort.split(',').join(' ')
        //     query=query.sort(sortBy)
        // }else{
        //     query=query.sort('-createdAt')
        // }
        


        //             FIELD LIMITING
        // if(req.query.fields){
        //     const fields= req.query.fields.split(',').join(' ');
        //     query = query.select(fields)
        // }else{
        //     query=query.select('-__v')
        // }



        //              PAGINATION
        // const page=req.query.page*1 || 1
        // const limit=req.query.limit*1 || 100
        // const skip=(page-1)*limit
        // query=query.skip(skip).limit(limit)
        const features=new APIFeatures(
            Tour.find(),req.query
        ).filter().sort().limitFields().paginate();

        const tours=await features.query;

        res.status(200).json({
            status:'success',
            result:tours.length,
            data: {
                tours
            }
        });
    // }catch(err){
    //     res.status(404).json({
    //         status:'fail',
    //         message:err
    //     })
    // }
});



const postTour=catchAsync(async(req,res,next)=>{
    // const newTour = new Tour({
    //     newTour.save()
    // })
    const newTour=await Tour.create(req.body)
        res.status(201).json({
            status:'success',
            data:{
                tour: newTour
            }
        })
                //replaced with function catchAsync
    // try{
    //     const newTour=await Tour.create(req.body)
    //     res.status(201).json({
    //         status:'success',
    //         data:{
    //             tour: newTour
    //         }
    //     })
    // }catch(err){
    //     res.status(400).json({
    //         status:'fail',
    //         message:err
    //     })
    // }
})
const getTourById=catchAsync(async(req,res,next)=>{
    // try{
        const tour=await Tour.findById(req.params.id);
        if(!tour){
            return next(new AppError("Not found",404));
        }
        
        res.status(200).json({
            status:'success',
            data:{
                tour
            }
        });
    // }catch(err){
    //     res.status(404).json({
    //         status:'fail',
    //         message:err
    //     })
    // }
});
const patchTour=catchAsync(async(req,res,next)=>{
    // try{
        const tour=await Tour.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new:true,
                runValidators:true
            }
        );
        res.status(200).json({
            status:'sucess',
            data:{
                tour
            }
        })

    // }catch(err){
    //     res.status(404).json({
    //         status:'fail',
    //         message:err
    //     })
    // }
})
const deleteTour=catchAsync(async(req,res,next)=>{
    // try{
        //const userRole=req.user.role;
        const tour=await Tour.findByIdAndDelete(req.params.id)
        // to show secret tour for admin
        //.setOptions({userRole});
        if(!tour){
            return next(new AppError(
                'Tour not found',404
            ))
        }
        res.status(204).json({
            status:'success',
            data:{
                tour
            }
        })

    // }catch(err){
    //     res.status(404).json({
    //         status:'fail',
    //         message:err
    //     })
    // }
})

const getTourStats=catchAsync(async (req,res,next) => {
    // try{
        const stats= await Tour.aggregate([
            {
                $match:{ratingsAverage:{$gte:4.5}}
            },
            {
                $group:{
                    _id:{$toUpper:'$difficulty'},
                    num:{ $sum:1},
                    numRatings:{ $sum: '$ratingsQuantity'},
                    avgRating:{ $avg: '$ratingsAverage'},
                    avgPrice:{ $avg:'$price'},
                    minPrice:{ $min:'$price'},
                    maxPrice:{ $max:'$price'}
                }
            },
            {
                $sort:{avgPrice:1}
            }
        ])

        res.status(201).json({
            status:'success',
            data:{
                stats
            }
        });
    // }catch(err){
    //     res.status(404).json({
    //         status:'fail',
    //         message:err
    //     })
    // }
})

const getMonthlyPlan=catchAsync(async(req,res,next)=>{
    // try{
        const year=req.params.year*1
        const plan=await Tour.aggregate([
            {
                $unwind:'$startDates'
            },
            {
                $match:{
                    startDates:{
                        $gte:new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group:{
                    _id:{$month: '$startDates'},
                    numTourStarts:{$sum:1},
                    tours:{$push: '$name'}

                }
            },
            {
                $addFields:{month:'$_id'}
            },
            {
                $project:{
                    _id:0
                }
            },
            {
                $sort:{numTourStarts:-1}
            },
            {
                $limit:12
            }
        ])
        res.status(201).json({
            status:'success',
            data:{
                plan
            }
        });
    // }catch(err){
    //     res.status(404).json({
    //         status:'fail',
    //         message:err
    //     })
    // }
})

export default{
    aliasTopTours,
    getAllTours,
    postTour,
    getTourById,
    patchTour,
    deleteTour,
    getTourStats,
    getMonthlyPlan
}