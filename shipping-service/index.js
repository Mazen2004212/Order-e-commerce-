const { Kafka } = require('kafkajs');

// إعداد Kafka
const kafka = new Kafka({
  clientId: 'shipping-service',
  brokers: ['kafka:9092']
});

const consumer = kafka.consumer({ groupId: 'shipping-group' });
const producer = kafka.producer();

const run = async () => {
  await consumer.connect();
  await producer.connect();

  await consumer.subscribe({ topic: 'order-packed', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const order = JSON.parse(message.value.toString());
      console.log(`🚚 Order packed: ${order.id}`);

      // simulate shipping...
      console.log(`✅ Order ${order.id} shipped successfully`);

      // send to next topic
      await producer.send({
        topic: 'order-shipped',
        messages: [
          { key: order.id.toString(), value: JSON.stringify(order) }
        ]
      });
    }
  });
};

run().catch(console.error);
