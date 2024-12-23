import express from 'express';
import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';

const router=express.Router();

router.post('/signup',authController.signup);
router.post('/login',authController.login);

router.post('/forgotPassword',
    authController.forgotPassword
);
router.patch('/resetPassword/:token',
    authController.resetPassword
);
router.patch('/updateMyPassword',
    authController.protect,
    authController.updatePassword
);

router.route('/')
.get(userController.getAllUsers)
.post(userController.postUser);

router.route('/:id')
.get(userController.getUsersById)
.patch(userController.patchUser)
.delete(userController.deleteUser);

export default router;
