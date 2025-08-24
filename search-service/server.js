import dotenv from "dotenv"
import helmet from "helmet"
import cors from "cors"
import express from "express"
import connectDB from "./src/config/db.js"
import logger from "./src/utils/logger.js"
import errorHandler from "./src/middleware/errorHandler.js"
import { consumeEvent, connectRabbitMq } from "./src/utils/rabbitmQ.js"
import { handleDeleteEvent, handleSearchEvent } from "./src/eventHandler/eventSearch.js"
import searchRoutes from "./src/routes/search.routes.js"


dotenv.config()

const app = express()

app.use(helmet())
app.use(cors())
app.use(express.json())

//Connect mongo db
await connectDB()

app.use('/api/search', searchRoutes)

app.use(errorHandler)

async function startServer(){
    try {
        await connectRabbitMq()
        await consumeEvent("post.create", handleSearchEvent);
        await consumeEvent("post.delete", handleDeleteEvent)
        //start server
        app.listen(process.env.PORT, () => {
            logger.info(`Server is running on port ${process.env.PORT}`)
        })

    } catch (error) {
        logger.error(`Failed to connect the server : ${error}`)
        process.exit(1)
    }
}

startServer()