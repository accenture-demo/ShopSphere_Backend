import express from "express"
import { UserSignUp ,UserSignIn , getAllCartItems ,addToCart,removeFromCart ,  getAllOrders ,addToFavorites , removeFromFavorites, getUserFavourites, placeOrder   } from "../controllers/User.js";
import { verifyToken } from "../middleware/verify.js";

const router = express.Router() ;

// user login and signup 

router.post("/signup" , UserSignUp);
router.post("/signin" , UserSignIn);

//order routes

router.get("/order" ,verifyToken , getAllOrders) ;
router.post("/order",verifyToken ,placeOrder);

// cart routes
router.get("/cart" ,verifyToken , getAllCartItems) ;
router.post("/cart" ,verifyToken , addToCart) ;
router.patch("/cart" ,verifyToken , removeFromCart) ;


// favourite  routes
router.get("/favourite" , verifyToken ,getUserFavourites) ;
router.post("/favourite" ,verifyToken , addToFavorites) ;
router.patch("/favourite" ,verifyToken , removeFromFavorites) ;


export default router ;