import express from "express";
import authController from "../controllers/authController.js";
import reviewController from "../controllers/reviewController.js";

const router=express.Router({mergeParams:true});

// POST /tour/234fad4/reviews
// POST /reviews

router.use(authController.protect);

router.route('/')
.get(
    reviewController.getAllReviews
)
.post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.postReview
)

router.route('/:id')
.get(
    reviewController.getReviewById
)
.patch(
    authController.restrictTo('user','admin'),
    reviewController.updateReview
)
.delete(
    authController.restrictTo('user','admin'),
    reviewController.deleteReview
)
export default router;