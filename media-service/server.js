import express, { Router } from "express"
import dotenv from "dotenv"
import cors from "cors"
import logger from "./src/utils/logger.js"
import helmet from "helmet"
import errorHandler from "./src/middleware/errorHandler.js"
import connectDB from "./src/config/db.js"
import router from "./src/routes/media.routes.js"

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

app.listen(port, ()=>{
    logger.info(`Server running PORT=${port}`)
})