import mongoose from "mongoose";
import logger from "../utils/logger.js"

//connect to db
const connectDB = async () => {
    try {
        console.log(process.env.MONGO_URL)
        await mongoose.connect(process.env.MONGO_URL)
        logger.info(`Database connected successfully`)
    } catch (error) {
        logger.error(`Database connection error: ${error}`)
        process.exit(1)
    }
}
 
export default connectDB