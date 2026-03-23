import mongoose, { mongo, Mongoose } from "mongoose";
import { User_Model } from "./user.model.js";
const subscription_schema = new Mongoose.Schema(
    {
        subscriber : {
            type :mongoose.Schema.Types.ObjectId,
            ref : User_Model,
        },
        channel : {
            type : mongoose.Schema.Types.ObjectId,
            ref : User_Model,
        }
    } , {timestamps:true})



export const Subscription = mongoose.model("Subscription" , subscription_schema);