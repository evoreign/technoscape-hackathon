const WebSocket = require('ws');
const amqp = require('amqplib');

const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    // Handle any messages sent by clients if needed
  });

  ws.on('close', () => {
    clients.delete(ws);
  });

  ws.send(JSON.stringify({ message: 'Connected to WebSocket server' }));
});

const startRabbitMQConsumer = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('chat_messages', { durable: true });

    channel.consume('chat_messages', (msg) => {
      if (msg !== null) {
        const message = msg.content.toString();
        console.log('Received:', message);
        
        // Broadcast message to all connected WebSocket clients
        clients.forEach((ws) => {
          ws.send(message);
        });

        channel.ack(msg);
      }
    }, {
      noAck: false
    });

    console.log('RabbitMQ Consumer started');
  } catch (error) {
    console.error('Error in RabbitMQ Consumer:', error);
  }
};

startRabbitMQConsumer();

wss.on('connection', (ws) => {
  clients.set(ws, true);
});

console.log('WebSocket server started on port 8080');
