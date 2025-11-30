const express = require('express');
const { Kafka } = require('kafkajs');
const cors = require('cors');
const mongoose = require("mongoose");
const connectDB = require("./db");
const Order = require("./models/order");

const app = express();
app.use(cors());
app.use(express.json());

connectDB(); // الاتصال بقاعدة البيانات

const kafka = new Kafka({
  clientId: 'order-service',
  brokers: ['kafka:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'order-consumer-group' });

// ➕ إضافة طلب جديد
app.post('/place-order', async (req, res) => {
  const { id, customerId, items } = req.body;

  try {
    const newOrder = new Order({ id, customerId, items });
    await newOrder.save();

    await producer.connect();
    await producer.send({
      topic: 'order-placed',
      messages: [{ value: JSON.stringify({ id, customerId, items }) }]
    });

    res.status(201).json({ message: 'Order placed', order: newOrder });
  } catch (err) {
    console.error("❌ Error placing order:", err.message);
    res.status(500).json({ error: 'Something went wrong.' });
  }
});

// 📋 عرض جميع الطلبات
app.get('/orders', async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

// ❌ حذف طلب
app.delete('/order/:id', async (req, res) => {
  const id = req.params.id;
  const deleted = await Order.findOneAndDelete({ id });
  if (deleted) {
    res.json({ status: `Order ${id} deleted.` });
  } else {
    res.status(404).json({ error: "Order not found." });
  }
});

// 🔁 تحديث الحالة يدويًا (من لوحة التحكم)
app.post('/update-status', async (req, res) => {
  const { id, status } = req.body;

  const order = await Order.findOne({ id });
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  order.status = status;
  await order.save();

  await producer.connect();
  await producer.send({
    topic: 'order-status-updated',
    messages: [{ value: JSON.stringify({ id, status }) }]
  });

  res.json({ message: 'Status updated', order });
});

// 🔎 استعلام طلب واحد
app.get('/order/:id', async (req, res) => {
  const { id } = req.params;
  const order = await Order.findOne({ id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

// 🧠 Consumer من Kafka لتحديث الحالة تلقائيًا
async function runConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'payment-completed', fromBeginning: true });
  await consumer.subscribe({ topic: 'order-packed', fromBeginning: true });
  await consumer.subscribe({ topic: 'order-shipped', fromBeginning: true });
  await consumer.subscribe({ topic: 'order-delivered', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      const data = JSON.parse(message.value.toString());
      const order = await Order.findOne({ id: data.orderId });
      if (!order) return;

      switch (topic) {
        case 'payment-completed':
          order.status = 'Paid';
          break;
        case 'order-packed':
          order.status = 'Packed';
          break;
        case 'order-shipped':
          order.status = 'Shipped';
          break;
        case 'order-delivered':
          order.status = 'Delivered';
          break;
      }

      await order.save();
      console.log(`📥 [${topic}] → Order ${data.orderId} updated to "${order.status}"`);
    }
  });
}

runConsumer().catch(console.error);

// 🟢 Test Endpoint
app.get('/', (req, res) => res.send('✅ Order Service is running'));

app.listen(3001, () => {
  console.log('✅ Order service listening on port 3001');
});
