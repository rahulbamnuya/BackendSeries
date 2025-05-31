import mongoose from "mongoose"
const SubscriptionSchema=new Schema({
subscriber:{
    type:Schema.Types.ObjectId, //on ewho subscribing
    ref:"User"
}
,
channel:{
    type:Schema.Types.ObjectId, //one to who " subscriber is subscribing"
    ref:"User"
}
},{timestamps:true})
export const Subscription =mongoose.model("Subscription",SubscriptionSchema)