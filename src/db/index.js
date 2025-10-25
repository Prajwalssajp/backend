import mongoose  from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDb = async () => {
    try { 
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${ DB_NAME}`)
        console.log(`\n MongoDB connected ${connectionInstance}`);
        console.log(`\n MongoDB connected ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log('MONGODB Connection error:',error);
        process.exit(1)
        
    }
}
export default connectDb;


