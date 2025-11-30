const { Kafka } = require('kafkajs');

// إعداد Kafka
const kafka = new Kafka({
  clientId: 'delivery-service',
  brokers: ['kafka:9092']
});

const consumer = kafka.consumer({ groupId: 'delivery-group' });
const producer = kafka.producer();

const run = async () => {
  await consumer.connect();
  await producer.connect();

  await consumer.subscribe({ topic: 'order-shipped', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const order = JSON.parse(message.value.toString());
      console.log(`📬 Order shipped: ${order.id}`);

      // simulate delivery
      console.log(`✅ Order ${order.id} delivered successfully`);

      await producer.send({
        topic: 'order-delivered',
        messages: [
          { key: order.id.toString(), value: JSON.stringify(order) }
        ]
      });
    }
  });
};

run().catch(console.error);
