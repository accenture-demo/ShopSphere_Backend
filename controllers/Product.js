import Products from '../models/Product.js'
import mongoose from 'mongoose'

export const addProducts = async (req,res,next) =>{
    try {
        const productArray = req.body ;
        
        if(!Array.isArray(productArray)){
            return next("Enter a valid array of product");
        }
        const createdProducts = [] ;

        for(const productInfo of productArray){
            const {title , name , desc , img , price , sizes , category} = productInfo ;

            const product = new Products({
                title , name , desc , img , price , sizes , category
            });

            const createdProduct = await product.save() ;
            createdProducts.push(createdProduct) ;
        }

        return res.status(201).json({msg : "products added successfully" , createdProducts})
    } catch (error) {
        next(error) ;
    }
}

export const getProducts = async (req,res ,next) => {

    try{
            let {categories,minPrice,maxPrice,sizes ,search}  = req.query ;
            sizes = sizes?.split(",");
            categories = categories?.split(",");
        
            const filter = {} ; // initially empty
            
            if(categories && Array.isArray(categories)){
                filter.category = {$in : categories} ;          // filtered out the produts which are in searched categories
            }
        
            if(sizes && Array.isArray(sizes)){
                filter.sizes = {$in : sizes} ;
            }
        
            if(minPrice || maxPrice){
                filter["price.org"] = {} ;
        
                if(minPrice){
                    filter["price.org"]["$gte"] = parseFloat(minPrice) ;
                }
                if(maxPrice){
                    filter["price.org"]["$lte"] = parseFloat(maxPrice) ;
                }
            }
        
            if(search){
                filter.$or = [
                    {title : {$regex : new RegExp(search , "i")}} ,
                    {desc : {$regex : new RegExp(search , "i")}} ,
                    // {categories : {$regex : new RegExp(search , "i")}} ,
                ]
            }
        
            const products = await Products.find(filter) ;
            return res.status(200).json(products);
        
        }catch(err){
            next(err) ;
        }
}

export const getProductById = async (req,res,next) => {
    try{
        const {id} = req.params;
        const product = await Products.findById(id) ;

        if(!product){
            return next("Product Not Found") ;
        }
        return res.status(200).json(product) ;
    }catch(err){
        return next(err);
    }
};