const { Kafka } = require('kafkajs');

// إعداد Kafka
const kafka = new Kafka({
  clientId: 'payment-service',
  brokers: ['kafka:9092']
});

const consumer = kafka.consumer({ groupId: 'payment-group' });
const producer = kafka.producer();

const run = async () => {
  await consumer.connect();
  await producer.connect();

  await consumer.subscribe({ topic: 'order-placed', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const order = JSON.parse(message.value.toString());
      console.log(`💰 Received order: ${order.id}`);

      // simulate payment logic...
      console.log(`✅ Payment completed for order ${order.id}`);

      // send to next topic
      await producer.send({
        topic: 'payment-completed',
        messages: [
          { key: order.id.toString(), value: JSON.stringify(order) }
        ]
      });
    }
  });
};

run().catch(console.error);

