import winston from 'winston'

//Adding logger for the identity service
const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "error" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: {service : 'identity-service'},
  transports: [
    new winston.transports.Console({
        format : winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }), // logs to console
    new winston.transports.File({ filename: "logs/error.log", level: "error" }), // only errors
    new winston.transports.File({ filename: "logs/combined.log" }), // all logs
  ],
});

export default logger;