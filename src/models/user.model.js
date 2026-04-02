import mongoose, { mongo, Mongoose } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";


const UserModel_Schema = new mongoose.Schema({

    username : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true, // this optimise the searching in the database
    },
    email : {
        type:String,
        required:true,
        unique:true,
        lowercase : true,
        trim : true,
    },
    fullname : {
        type :String,
        required : true,
        index:true,
    },
    avatar : {
        type : String , // cloudnary url
        required : true,
        default : 'default-avatar-png' // add a default avatar png to the user if no image is provided byt the user
    },
    password : {
        type : String,
        required:[true , 'password is required'],
    },
    cover_image : {
        type : String,
    },
    watch_history : [
        {
            type:mongoose.Schema.Types.ObjectId,
            ref : "Video",
        }
    ],
    refreshToken : {
        type : String,
    },
    is_Verified : {
        type : Boolean,
        default:false,
    },
    emailVerificationToken:{
        type : String,
    },
    emailVerificationExpiry: {
        type:Date,
    }
} , {timestamps : true});

// we cannot directly encrypt the password so that why we use the mongoose hooks

// there are few operation that we want to perform before actually saving the data to the database 
// this can be done using the middlewares / hooks of the mongoose


// mongoose allows us to write the methods and use middlewares

// so we will also write some methods to check wheter the passwords is correct or not

// avoid using the arrow function as in the arrow function the this keyword do not hold the refrence of the this keyword 

UserModel_Schema.pre("save", async function (next) {
    if(this.isModified("password"))
    {
        this.password =  await bcrypt.hash(this.password , 10);
    }
})


UserModel_Schema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password , this.password);
}

UserModel_Schema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id : this._id,
        email:this.email,
        fullname : this.fullname,
        username:this.username,
    } , process.env.ACCESS_TOKEN_SECRET , {
        expiresIn : process.env.ACCESS_TOKEN_EXPIRY,
    })
}

UserModel_Schema.methods.generaterefreshToken = function () {
    return jwt.sign({
        _id : this._id,
        email:this.email,
        fullname : this.fullname,
        username:this.username,
    } , process.env.REFRESH_TOKEN_SECRET, {
        expiresIn : process.env.REFRESH_TOKEN_EXPIRY,
    })
}
 export const User_Model = mongoose.model("User_Model" , UserModel_Schema);