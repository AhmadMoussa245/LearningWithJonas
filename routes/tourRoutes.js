import express from "express";
import tourController from '../controllers/tourController.js'
import authController from "../controllers/authController.js";

const router=express.Router();

// router.param('id',tourController.checkId)

router.get('/top-5-cheap',tourController.aliasTopTours,tourController.getAllTours)
router.get('/tour-stats',tourController.getTourStats)
router.get('/monthly-plan/:year',tourController.getMonthlyPlan)

router.route('/')
.get(authController.protect,tourController.getAllTours)
.post(tourController.postTour)

router.route('/:id')
.get(authController.protect,tourController.getTourById)
.patch(tourController.patchTour)
.delete(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.deleteTour)

export default router
