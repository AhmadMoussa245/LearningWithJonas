import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import APIFeatures from "../utils/apiFeatures.js";

const deleteOne= Model=>catchAsync(async(req,res,next)=>{
    const doc=await Model.findByIdAndDelete(req.params.id);
    if(!doc){
        return next(new AppError(
            'no Document found',404
        ))
    }
    res.status(204).json({
        status:'success',
        data: null
    })
})

const postOne=Model=>catchAsync(async(req,res,next)=>{
    const doc=await Model.create(req.body)
    
    res.status(201).json({
        status:'success',
        data:{
            data: doc
        }
    })
})

const patchOne=Model=>catchAsync(async(req,res,next)=>{
    const doc=await Model.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new:true,
            runValidators:true
        }
    );
    if(!doc){
        return next(new AppError(
            'No document found',404
        ));
    };
    res.status(200).json({
        status:'success',
        data:{
            data:doc
        }
    })
})

const getOne=(Model,popOptions)=>
catchAsync(async(req,res,next)=>{
    let query = Model.findById(req.params.id);
    if(popOptions){
        query=query.populate(popOptions);
    };
    const doc=await query;

    if(!doc){
        return next(new AppError(
            "Not found",404
        ));
    };
    res.status(200).json({
        status:'success',
        data:{
            doc
        }
    });
})

const getAll=Model=>catchAsync(async(req,res,next)=>{
    // to allow nested Get reviews on tour
    let filter;
    if(req.params.tourId){
        filter={tour:req.params.tourId};
    };
    
    const features=new APIFeatures(
        Model.find(filter),req.query
    ).filter().sort().limitFields().paginate();

    // const doc=await features.query.explain();
    const doc=await features.query;

    res.status(200).json({
        status:'success',
        result:doc.length,
        data: {
            doc
        }
    });
});

export default{
    deleteOne,
    postOne,
    patchOne,
    getOne,
    getAll
}