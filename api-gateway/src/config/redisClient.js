import Redis from "ioredis";
import dotenv from 'dotenv';
import logger from "../utils/logger.js"

dotenv.config()

const redisClient = new Redis(process.env.REDIS_URL)

//Log when connected
redisClient.on('connect', () => {
    console.log('✅ Redis connected')
})

//handle errors
redisClient.on('error', (err) => {
    logger.error('❌ Redis error', err)
    process.exit(1)
})

export default redisClient;