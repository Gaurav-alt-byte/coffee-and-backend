import mongoose, { mongo, Mongoose } from "mongoose";
import { User_Model } from "./user.model.js";
const subscription_schema = new mongoose.Schema(
    {
        subscriber : {
            type :mongoose.Schema.Types.ObjectId,
            ref : User_Model,
        },
        channel : {
            type : mongoose.Schema.Types.ObjectId,
            ref : User_Model,
        },
        status :{
            type :String,
            enum : ["Active" , "Blocked"],
            default : "Active"
        }
    } , {timestamps:true})



export const Subscription = mongoose.model("Subscription" , subscription_schema);