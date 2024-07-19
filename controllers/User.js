import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
// import {createError}
import User from "../models/User.js"
import Order from "../models/Order.js"
import Product from "../models/Product.js"
import { addProducts } from "./Product.js"

dotenv.config() ;

// user registration ----------------------------------------------------------

export const UserSignUp = async (req,res,next) => {
    try{
        const {name , email , password , img } = req.body ;
        const alreadyExist = await User.findOne({email}).exec() ;
        
        if(alreadyExist){
            // console.log("User Already Exist");
            return next("user already exist") ;
        }
        const salt = bcrypt.genSaltSync(10) ;
        const hashedPassword = bcrypt.hashSync(password,salt);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            img
        })
        
        const createdUser = user.save() ;
        const token = jwt.sign({id:createdUser._id} , process.env.JWT, {expiresIn : "5 years"})
        
        return res.status(200).json({token,user}) ;
        
    }catch(err){
        console.error(err);
    }
}


// user Login -----------------------------------------------------------------

export const UserSignIn = async (req,res,next) => {
    try{
        const { email , password } = req.body ;
        const alreadyExistUser = await User.findOne({email}).exec() ;

        console.log(req.body) ;
        

        if(!alreadyExistUser){
            // console.log("User Already Exist");
            return next("user does not exist") ;
        }
        const salt = bcrypt.genSaltSync(10) ;
        const hashedPassword = bcrypt.hashSync(password,salt);

        const isPasswordCorrect = await bcrypt.compareSync(password,alreadyExistUser.password) ;

        if(!isPasswordCorrect ){
            return next("Invalid email or Password") ;
        }
        const token = jwt.sign({id:alreadyExistUser._id} , process.env.JWT, {expiresIn : "5 years"})

        return res.status(200).json({token,user:alreadyExistUser}) ;

    }catch(err){
        console.error(err);
    }
}



  
export const addToFavorites = async (req, res, next) => {
try {
    const { productId } = req.body;
    const userJWT = req.user;
    const user = await User.findById(userJWT.id);
    // console.log(productId);
    // console.log("hello from fav func ");

    if (!user.favourites.includes(productId)) {
    user.favourites.push(productId);
    await user.save();
    }

    return res
    .status(200)
    .json({ message: "Product added to favorites successfully", user });
} catch (err) {
    next(err);
}
};

export const removeFromFavorites = async (req, res, next) => {
try {
    const { productId } = req.body;
    const userJWT = req.user;
    const user = await User.findById(userJWT.id);
    user.favourites.remove(productId) ;

    await user.save();
    return res
    .status(200)
    .json({ message: "Product removed from favorites successfully", user });
} catch (err) {
    next(err);
}
};

export const getUserFavourites = async (req, res, next) => {
try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate("favourites").exec();

    if (!user) {
    return next(createError(404, "User not found"));
    }

    return res.status(200).json(user.favourites);
} catch (err) {
    next(err);
}
};

export const removeFromCart = async(req,res,next) => {

    try{
        const {productId,quantity} = req.body ;
        const userJWT = req.user ;
        const user = await User.findById(userJWT.id) ;
    
        if(!user){
            return next("User Not found . please Login first") ;
        }
    
        const productIndex = await user.cart.findIndex((item) => item.product.equals(productId)) ;
    
        if(productIndex !== -1){
            if(quantity && quantity>0){
                user.cart[productIndex].quantity-=quantity ;
                if(user.cart[productIndex].quantity <=0){
                    user.cart.splice(productIndex,1);
                }
            }
        }
        await user.save() ;
        return res.status(200).json({message : "removed from cart",user});

    }catch(err){
        next(err)
    }
}

export const addToCart = async(req,res,next) => {
    try{
        const {productId,quantity} = req.body ;
        const userJWT = req.user ;

        const user = await User.findById(userJWT.id) ;

        // if(!user){
        //     return next("User not found . Please Login to add") ;
        // }

        console.log(user) ;

        const ItemExistInCart = user.cart.findIndex((item) => 
            item?.product?.equals(productId)
        );

        if(ItemExistInCart === -1 ) {
            user.cart.push({product:productId , quantity})
        }else{
            user.cart[ItemExistInCart].quantity+=quantity ;
        }

        await user.save() ;
        return res.status(200).json({message : "added to cart" , user })

    }catch(err){
        next(err) ;
    }
}


export const getAllCartItems = async (req,res,next) => {
    try{
        const userJWT = req.user ;
        const user = await User.findById(userJWT.id).populate({
            path : "cart.product",
            model : "Products",
        });
        const cartItems = user.cart ;
        return res.status(200).json(cartItems);

    }catch(err){
        next(err) ;
    }
}

export const placeOrder = async (req, res, next) => {
    try {

        console.log("hii from backend place order")
      const { products, address, totalAmount } = req.body;
      const userJWT = req.user;
      const user = await User.findById(userJWT.id);
      const order = new Order({
        products,
        user: user._id,
        total_amount: totalAmount,
        address,
      });
      await order.save();
  
      user.save();
      user.cart = [];
      await user.save();
  
      return res
        .status(200)
        .json({ message: "Order placed successfully", order });
    } catch (err) {
      next(err);
    }
};

export const getAllOrders = async (req, res, next) => {
try {
    const user = req.user;
    const orders = await Order.find({ user: user.id });
    return res.status(200).json(orders);
} catch (err) {
    next(err);
}
};
  
