const amqp = require('amqplib');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map(); // Map to store WebSocket clients and their transaction IDs

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');

  ws.on('message', (message) => {
    const { transactionId } = JSON.parse(message);
    clients.set(ws, transactionId); // Associate the client with the transactionId
    console.log(`Client subscribed to transactionId: ${transactionId}`);
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });
});

async function startRabbitMQConsumer() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const exchange = 'chat_exchange';

    await channel.assertExchange(exchange, 'topic', { durable: false });
    const queue = await channel.assertQueue('', { exclusive: true });

    await channel.bindQueue(queue.queue, exchange, 'chat.#');

    channel.consume(queue.queue, (msg) => {
      if (msg) {
        const message = JSON.parse(msg.content.toString());
        const { transactionId, message: chatMessage } = message;
        
        clients.forEach((clientTransactionId, ws) => {
          if (clientTransactionId === transactionId && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ transactionId, message: chatMessage }));
            console.log(`Sent message to client for transactionId: ${transactionId}`);
          }
        });

        channel.ack(msg);
      }
    });

    console.log('RabbitMQ Consumer started');
  } catch (error) {
    console.error('Error in RabbitMQ Consumer:', error);
  }
}

startRabbitMQConsumer();
