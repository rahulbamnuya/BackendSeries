import { DataBase_Name } from "../constant.js";
import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const connectioninstance = await mongoose.connect(`${process.env.MONGO_URI}/${DataBase_Name}`);
        console.log(`✅ MongoDB connected to database: ${DataBase_Name}`);
        // console.log(`ℹ️ MongoDB connection instance:`, connectioninstance.connection.host);
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
