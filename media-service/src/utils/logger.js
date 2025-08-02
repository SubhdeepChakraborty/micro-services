import winston from "winston"
import dotenv from "dotenv"

dotenv.config()

//Adding logger for the media-service
const logger = winston.createLogger({
    level : process.env.NODE_ENV === "production" ? "info" : "debug",
    format : winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({stack : true}),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta : {service : 'media-service'},
    transports: [
        new winston.transports.Console({
            format : winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({
            filename : "logs/error.logs",
            level : "error"
        }), //only erros
        new winston.transports.File({
            filename : "logs/combined.log"
        }) // all logs
    ]
})

export default logger;