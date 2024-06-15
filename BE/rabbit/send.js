const amqp = require('amqplib');

async function publishMessage(transactionId, message) {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const exchange = 'chat_exchange';

    await channel.assertExchange(exchange, 'topic', { durable: false });
    const routingKey = `chat.${transactionId}`;
    
    const msgBuffer = Buffer.from(JSON.stringify({ transactionId, message }));
    channel.publish(exchange, routingKey, msgBuffer);

    console.log(`Message sent to exchange: ${message}`);
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Error publishing message:', error);
  }
}

module.exports = { publishMessage };
