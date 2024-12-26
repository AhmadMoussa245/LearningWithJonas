import Review from "../models/reviewModel.js"
import factory from './handlerFactory.js';
// import catchAsync from "../utils/catchAsync.js";


const setTourUserIds=(req,res,next)=>{
    // Those if conditions Allow nested routes 
    if(!req.body.tour){
        req.body.tour=req.params.tourId;
    };
    // we get req.user.id from protect middleware
    if(!req.body.user){
        req.body.user=req.user.id;
    };
    next();
}

const getAllReviews=factory.getAll(Review);
const getReviewById=factory.getOne(Review);
const postReview=factory.postOne(Review);
const updateReview=factory.patchOne(Review);
const deleteReview=factory.deleteOne(Review);

export default{
    getAllReviews,
    setTourUserIds,
    getReviewById,
    updateReview,
    postReview,
    deleteReview
}