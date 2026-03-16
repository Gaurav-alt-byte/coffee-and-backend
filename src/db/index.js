import mongoose from "mongoose"
import {DB_name} from "../constants.js"

const connectDB = async()=>{
    try{
        const connection_instance = await mongoose.connect(`${process.env.MONGO_db_url}/${DB_name}`);
        console.log(`MongoDB is connected ${connection_instance.connection.host}`);
    }
    catch(error){
        console.log("ERROR : " , error);
    }
};
export default connectDB;