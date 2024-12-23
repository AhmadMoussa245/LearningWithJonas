import morgan from 'morgan';
import express from 'express';
import AppError from './utils/appError.js'
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import globalErrorHandler from './controllers/errorController.js'

const app=express();

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
};

app.use(express.json());
app.use(express.static(`./public`));
app.use((req,res,next)=>{
    req.requestTime=Date.now();
    next();
})


app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);

app.all('*',(req,res,next)=>{
    
                // 1) 
    // res.status(404).json({
    //     status:'fail',
    //     message:`Can't find ${req.originalUrl} on this server` 
    // });
    // next();

                // 2)
    // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    // err.status='fail';
    // err.statusCode=404;
    //next();

                // 3)
    next(new AppError(
        `Can't find ${req.originalUrl} on this server!`,
        404
    ));
});

app.use(globalErrorHandler)

export default app;