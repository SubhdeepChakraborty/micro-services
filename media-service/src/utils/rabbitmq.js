import amqp from "amqplib";
import logger from "../utils/logger.js";
import dotenv from "dotenv";

dotenv.config();

//connection and creating channel
//Why using rabbitMQ in order to connect with different services

let connection = null;
let channel = null;

const exchange_name = "facebook_events";

async function connectRabbitMq() {
  try {
    connection = await amqp.connect(process.env.RABBIT_MQ);
    channel = await connection.createChannel();

    await channel.assertExchange(exchange_name, "topic", { durable: false });
    logger.info("Connected to rabbitMQ");
    return channel;
  } catch (error) {
    logger.error(`Error connecting to rabbitMq : ${error}`);
  }
}

async function publishEvent(routingKey, message) {
  if (!channel) {
    await connectRabbitMq();
  }
  channel.publish(
    exchange_name,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
  logger.info(`Event published routing key: ${routingKey}`);
}

async function consumeEvent(routingKey, callback) {
   if (!channel) {
     await connectRabbitMq();
   }

   const q = await channel.assertQueue("", {exclusive : true})
   await channel.bindQueue(q.queue, exchange_name, routingKey)
   channel.consume(q.queue, (msg) => {
    if(msg != null){
        const content = JSON.parse(msg.content.toString());
        callback(content)
        channel.ack(msg)
    }
   })
   logger.info(`Subscribed to event: ${routingKey}`)
}


export { connectRabbitMq, publishEvent, consumeEvent };
