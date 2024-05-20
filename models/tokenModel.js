import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    userId:{type:String, ref:"user", required:true},
    token:{type:String, required:true}
})

const tokenModel = mongoose.models.token || mongoose.model("token", tokenSchema)

export default tokenModel