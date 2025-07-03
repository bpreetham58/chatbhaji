import mongoose from "mongoose";

export const dbConnection  =()=>{
    mongoose
        .connect(process.env.MONGO_URI,{
            dbName:"CHATBHAJI_APP",
        })
        .then(()=>{
            console.log("connected to db.");
        })
        .catch((err)=>{
            console.error("Error connecting to the database:", err);
        });
};