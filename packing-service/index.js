const { Kafka } = require('kafkajs');

// إعداد Kafka
const kafka = new Kafka({
  clientId: 'packing-service',
  brokers: ['kafka:9092']
});

const consumer = kafka.consumer({ groupId: 'packing-group' });
const producer = kafka.producer();

const run = async () => {
  await consumer.connect();
  await producer.connect();

  await consumer.subscribe({ topic: 'payment-completed', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const order = JSON.parse(message.value.toString());
      console.log(`📦 Received payment for order: ${order.id}`);

      // simulate packing...
      console.log(`✅ Order ${order.id} packed successfully`);

      // send to next topic
      await producer.send({
        topic: 'order-packed',
        messages: [
          { key: order.id.toString(), value: JSON.stringify(order) }
        ]
      });
    }
  });
};

run().catch(console.error);
