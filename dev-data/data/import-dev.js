import 'dotenv/config'
import fs from 'node:fs'
import mongoose from 'mongoose'
import Tour from '../../models/tourModel.js'

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
    console.log('DB connection success')
})

//READ JSON FILE
const tours=JSON.parse(
    fs.readFileSync(`./dev-data/data/tours-simple.json`,'utf-8')
)

//IMPORT DATA INTO DB
const importData=async()=>{
    try{
        await Tour.create(tours)
        console.log('data loaded')
    }catch(err){
        console.log(err)
    }
    process.exit();
}

// DELETE ALL DATA FROM DB
const deleteData=async()=>{
    try{
        await Tour.deleteMany()
        console.log('data deleted')
    }catch(err){
        console.log(err)
    }
    process.exit();
}
if(process.argv[2]==='--import'){
    importData();
}else if(process.argv[2]=='--delete'){
    deleteData();
}
// console.log(process.argv)