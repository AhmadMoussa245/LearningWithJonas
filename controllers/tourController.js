import Tour from '../models/tourModel.js'
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import factory from './handlerFactory.js';
// import APIFeatures from '../utils/apiFeatures.js';

const aliasTopTours=(req,res,next)=>{
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price'
    req.query.fields = 'name,price,ratingAverage,summary,difficulty'
    next()
}

const getAllTours=factory.getAll(Tour);
const postTour=factory.postOne(Tour);
const getTourById=factory.getOne(Tour,{path:'reviews'});
const patchTour=factory.patchOne(Tour);
const deleteTour=factory.deleteOne(Tour);


const getTourStats=catchAsync(async (req,res,next) => {
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
})

const getMonthlyPlan=catchAsync(async(req,res,next)=>{
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
})

const getTourWithin=catchAsync(async(req,res,next)=>{
    const {distance,latlng,unit}=req.params;
    const [lat,lng]=latlng.split(',');
    const radius=unit==='mi'?distance/3963.2:distance/6378.1
    
    if(!lng || !lat){
        next(new AppError(
            'please provide latitude and longitud',
            400
        ));
    };
    const tours=await Tour.find({
        startLocation:{
            $geoWithin:{
                $centerSphere:[
                    // always lng first
                    [lng,lat],
                    radius
                ]
            }
        }
    });

    res.status(200).json({
        status:'success',
        results:tours.length,
        data:{
            data:tours
        }
    })
})

const getDistances=catchAsync(async(req,res,next)=>{
    const {latlng,unit}=req.params;
    const [lat,lng]=latlng.split(',');
    const multiplier=unit==='mi'?0.000621371:0.001

    if(!lng || !lat){
        next(new AppError(
            'please provide latitude and longitud',
            400
        ));
    };

    const distances=await Tour.aggregate([
        {
            // geoNear should always be first
            // if it's first and u have error look at other aggregation
            $geoNear:{
                near:{
                    type:'Point',
                    coordinates:[lng*1,lat*1]
                },
                distanceField:'distance',
                distanceMultiplier:multiplier
            }
        },
        {
            $project:{
                distance:1,
                name:1,
            }
        }
    ])

    res.status(200).json({
        status:'success',
        data:{
            data:distances
        }
    })
})

export default{
    aliasTopTours,
    getAllTours,
    postTour,
    getTourById,
    patchTour,
    deleteTour,
    getTourStats,
    getMonthlyPlan,
    getTourWithin,
    getDistances
}

// const getAllTours=catchAsync(async(req,res,next)=>{
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
//      const features=new APIFeatures(
//          Tour.find(),req.query
//      ).filter().sort().limitFields().paginate();
//
//      const tours=await features.query;
//
//      res.status(200).json({
//          status:'success',
//          result:tours.length,
//          data: {
//              tours
//          }
//      });
    // }catch(err){
    //     res.status(404).json({
    //         status:'fail',
    //         message:err
    //     })
    // }
//});



// const postTour=catchAsync(async(req,res,next)=>{
//     // const newTour = new Tour({
//     //     newTour.save()
//     // })
//     const newTour=await Tour.create(req.body)
//         res.status(201).json({
//             status:'success',
//             data:{
//                 tour: newTour
//             }
//         })
//                 //replaced with function catchAsync
//     // try{
//     //     const newTour=await Tour.create(req.body)
//     //     res.status(201).json({
//     //         status:'success',
//     //         data:{
//     //             tour: newTour
//     //         }
//     //     })
//     // }catch(err){
//     //     res.status(400).json({
//     //         status:'fail',
//     //         message:err
//     //     })
//     // }
// })

// const getTourById=catchAsync(async(req,res,next)=>{
     // try{
//         const tour=await Tour.findById(req.params.id)
//         .populate('reviews');
//         if(!tour){
//             return next(new AppError("Not found",404));
//         }
        
//         res.status(200).json({
//             status:'success',
//             data:{
//                 tour
//             }
//         });
    // }catch(err){
    //     res.status(404).json({
    //         status:'fail',
    //         message:err
    //     })
    // }
// });
// const patchTour=catchAsync(async(req,res,next)=>{
     // try{
//         const tour=await Tour.findByIdAndUpdate(
//             req.params.id,
//             req.body,
//             {
//                 new:true,
//                 runValidators:true
//             }
//         );
//         res.status(200).json({
//             status:'sucess',
//             data:{
//                 tour
//             }
//         })

    // }catch(err){
    //     res.status(404).json({
    //         status:'fail',
    //         message:err
    //     })
    // }
// })

// const deleteTour=catchAsync(async(req,res,next)=>{
//      try{
//         const tour=await Tour.findByIdAndDelete(req.params.id)
        //const userRole=req.user.role;
         // to show secret tour for admin
         //.setOptions({userRole});
//         if(!tour){
//             return next(new AppError(
//                 'Tour not found',404
//             ))
//         }
//         res.status(204).json({
//             status:'success',
//             data:{
//                 tour
//             }
//         })

    // }catch(err){
    //     res.status(404).json({
    //         status:'fail',
    //         message:err
    //     })
    // }
// })
