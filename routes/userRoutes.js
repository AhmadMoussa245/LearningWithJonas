import express from 'express';
import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';
import reviewController from '../controllers/reviewController.js';

const router=express.Router();

router.post('/signup',authController.signup);
router.post('/login',authController.login);

router.post('/forgotPassword',
    authController.forgotPassword
);
router.patch('/resetPassword/:token',
    authController.resetPassword
);

// all api after this line are protected
router.use(authController.protect);

router.get('/me',
    userController.getMe,
    userController.getUsersById
)
router.patch('/updateMyPassword',
    authController.updatePassword
);
router.patch('/updateMe',
    userController.updateMe
)
router.delete('/deleteMe',
    userController.deleteMe
)

// all api after this line will be only for admins
// and protected from previous middleware
router.use(authController.restrictTo('admin'));

router.route('/')
.get(userController.getAllUsers)
.post(userController.postUser);

router.route('/:id')
.get(userController.getUsersById)
.patch(userController.patchUser)
.delete(userController.deleteUser);



export default router;
