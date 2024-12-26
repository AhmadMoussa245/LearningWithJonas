import hpp from 'hpp';
import morgan from 'morgan';
import helmet from 'helmet';
import xss from 'xss-clean';
import express from 'express';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import AppError from './utils/appError.js';
import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';
import reviewRouter from './routes/reviewRoutes.js'
import mongoSanitize from 'express-mongo-sanitize';
import globalErrorHandler from './controllers/errorController.js'

const app=express();
// Global Middleware
// Set security HTTP headers
app.use(helmet());

// Development logging
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
};

// Limit request from same api
const limiter=rateLimit({
    max:100,
    windowMs: 60*60*1000,
    message: 'Too many requests from this IP,try again in an hour'
});
app.use('/api',limiter);

// Body parser, reading data from body into req.body
app.use(express.json({limit:'10kb'}));

// Data sanitization against noSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution (use last)
app.use(hpp({
    // queries allowed to be repeated
    whitelist:[
        "duration",
        "ratingsAverage",
        "ratingsQuantity",
        "maxGroupSize",
        "difficulty",
        "price"
    ]
}));

app.use(compression());

// Serving static files
app.use(express.static(`./public`));

// Test middleware
app.use((req,res,next)=>{
    req.requestTime=Date.now();
    next();
})


app.use('/api/v1/tours',tourRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/reviews',reviewRouter);

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