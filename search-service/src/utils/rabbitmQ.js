import amqp from "amqplib"
import logger from "../utils/logger.js"

//connection and creating channel
let connection = null
let channel = null

const exchangeName = 'facebook_events';

async function connectRabbitMq() {
    try {
        connection = await amqp.connect(process.env.RABBIT_MQ);
        channel = await connection.createChannel()

        await channel.assertExchange(exchangeName, 'topic', {
            durable : false
        })
        logger.info('connected to rabbitMq')
        return channel
    } catch (error) {
        logger.error(`Error connecting to rabbitMq : ${error}`)
    }
}

async function consumeEvent(routingKey, callback) {
    if(!channel){
        await connectRabbitMq()
    }
    const q = await channel.assertQueue('', {exclusive : true})
    await channel.bindQueue(q.queue, exchangeName, routingKey)
    channel.consume(q.queue, (msg) => {
        if(msg != null){
            const content = JSON.parse(msg.content.toString());
            callback(content)
            channel.ack(msg)
        }
    })
    logger.info(`Subscribed to ${routingKey}`);
}

export {
    connectRabbitMq,
    consumeEvent
}