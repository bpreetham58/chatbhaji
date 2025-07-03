import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
   senderId:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
   },
   ReceiverId:{
    type: mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"User",
   },
    text:String,
    media:String,
},
{timestamps:true});


export const Message=mongoose.model("Message",messageSchema);