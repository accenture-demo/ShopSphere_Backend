import express from "express"
import cors from 'cors'
import mongoose from "mongoose";
import * as dotenv from "dotenv"
import UserRouter from "./routes/User.js";
import ProductRouter from "./routes/Product.js"


dotenv.config() ;
const app = express() ;
app.use(cors()) ;
app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({extended:true}));


// error function -----------------------------------------------------------

app.use((err,req,res,next) => {
    const status = err.status || 500 ;
    const message = err.message ||"Something went wrong" ;
    return res.status(status).json({
        success: false,
        status,
        message,
    })
})



app.get('/',async(req,res) =>{
    res.status(200).json({
        message: "hello world"
    })
})

app.use("/api/user",UserRouter) ;
app.use("/api/product",ProductRouter) ;



const connectToDB = () => {
    mongoose.set('strictQuery',true) ;
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=> console.log("Connected To mongoDB"))
    .catch((err) => {
        console.log("Failed to connect")
        console.log(err)
    })
}

const startServer = async () => {
    try {
        connectToDB() ;
        app.listen(process.env.PORT || 8000 , () => console.log("Server started on port 8000")) ;
    } catch (error) {
        console.error(error) ;
    }
}

startServer() ;