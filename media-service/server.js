import express, { Router } from "express"
import dotenv from "dotenv"
import cors from "cors"
import logger from "./src/utils/logger.js"
import helmet from "helmet"
import errorHandler from "./src/middleware/errorHandler.js"
import connectDB from "./src/config/db.js"
import router from "./src/routes/media.routes.js"
import { connectRabbitMq, consumeEvent } from "./src/utils/rabbitmq.js"
import { handlePostDeleted } from "./src/eventhandler/media-event-handler.js"

const app = express()
dotenv.config()
app.use(cors())
app.use(helmet())

const port = process.env.PORT

//Db connection
connectDB()

//ratelimit---Have to added


//sensitive -- have to add


//for testing 
app.use('/api/media', router)

app.use(errorHandler)

async function startServer() {
     try {
       await connectRabbitMq();

       //consume all the events
       await consumeEvent("post.delete", handlePostDeleted);

       //start server
       app.listen(process.env.PORT || 5000, () => {
         logger.info(`Server is running on port ${process.env.PORT || 3002}`);
       });
     } catch (error) {
       logger.error("Failed to connect to server", error);
       process.exit(1);
     }
}

startServer()

app.listen(port, ()=>{
    logger.info(`Server running PORT=${port}`)
})