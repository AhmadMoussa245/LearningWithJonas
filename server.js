
process.on('uncaughtException',err=>{
    console.log('UNCAUGHT EXCEPTION! Shutting down...');
    console.log(err.name,err.message);
    process.exit(1);
})
import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';

const DB=process.env.DATABASE
.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
)

mongoose.connect(DB,{
    useUnifiedTopology:true,
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
}).then(con=>{
    console.log('DB connection success');
});

const PORT=process.env.PORT ;
const server=app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
});

process.on('unhandledRejection',err=>{
    console.log('UNHANLED REJECTION! Shutting down...');
    console.log(err.name,err.message);
    server.close(()=>{
        process.exit(1);
    });
});