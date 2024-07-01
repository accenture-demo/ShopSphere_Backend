import jwt from "jsonwebtoken";

export const verifyToken = async (req,res,next) =>{
    try{
        if(!req.headers.authorization){
            return next("user not authenticated") ;
        }
        const token = req.headers.authorization.split(" ")[1] ;
        if(!token){
            return next("user not authenticated") ;
        }
        
        const decode = jwt.verify(token,process.env.JWT)
        req.user = decode ;
        return next() ;
        

    }catch(err){
        return next(err) ;
    }
}