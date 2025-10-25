// require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'
dotenv.config({
    path:'./.env'
})
import connectDb from "./db/index.js"
import {app} from './app.js'

console.log('MONGODB_URI:', process.env.MONGODB_URI);
console.log('PORT:', process.env.PORT);
//  after completion async task returns promise
connectDb()
.then(()=>{
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`Server is runnig at port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGO DB connection failed !!!!",err);
})





/*
import express from 'express'
const app = express()
( async() => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Error",error);
            throw error
        })
        app.listen(process.envPORT,()=>{
            console.log(`App is listening on port ${process.env.envPORT}`);    
        })
    } catch (error) {
        console.log("ERROR ",error);
        throw err
    }
} )()
*/