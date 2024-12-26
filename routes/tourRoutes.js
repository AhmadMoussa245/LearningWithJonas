import express from "express";
import tourController from '../controllers/tourController.js'
import authController from "../controllers/authController.js";
import reviewRouter from "../routes/reviewRoutes.js"

const router=express.Router();

// router.param('id',tourController.checkID);

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews

router.use('/:tourId/reviews',reviewRouter);

router.get('/top-5-cheap',tourController.aliasTopTours,tourController.getAllTours)
router.get('/tour-stats',tourController.getTourStats)
router.get('/monthly-plan/:year',
    authController.protect,
    authController.restrictTo(
        'admin','lead-guide','guide'
    ),
    tourController.getMonthlyPlan
)

//                     query way
//   /tours-within?distance=233&center=-40,45&unit=mi
//                     this way
//   /tours-within/233/center/-40,45/unit/mi
router.route(
  '/tours-within/:distance/center/:latlng/unit/:unit'
).get(tourController.getTourWithin)

router.route('/distances/:latlng/unit/:unit')
.get(tourController.getDistances);

router.route('/')
.get(tourController.getAllTours)
.post(
    authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.postTour
)

router.route('/:id')
.get(tourController.getTourById)
.patch(
    authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.patchTour
)
.delete(
    authController.protect,
    authController.restrictTo('admin','lead-guide'),
    tourController.deleteTour
)


export default router
