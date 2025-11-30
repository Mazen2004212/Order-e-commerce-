const { Kafka } = require('kafkajs');
const nodemailer = require("nodemailer");

// إعداد Kafka
const kafka = new Kafka({
  clientId: 'notification-service',
  brokers: ['kafka:9092']
});

const consumer = kafka.consumer({ groupId: 'notification-group' });

// إعداد البريد الإلكتروني
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'king.mezo4119@gmail.com',
    pass: 'exgvlnufqpgthzyb' // كلمة مرور التطبيق من Gmail
  }
});

function sendEmail(to, subject, text) {
  const mailOptions = {
    from: '"Mazen project" <king.mezo4119@gmail.com>',
    to,
    subject,
    text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log('❌ Email Error:', error);
    }
    console.log('✅ Email sent:', info.response);
  });
}

// تشغيل الكونسيومر
const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'order-delivered', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const order = JSON.parse(message.value.toString());
      console.log(`📩 Notification: Order ${order.id} delivered!`);

      // إرسال إيميل للعميل (هنا الإيميل ثابت، ممكن تخليه dynamic حسب بيانات order)
      sendEmail('lucasmuraa7@gmail.com', 'Order Delivered', `Your order #${order.id} has been successfully delivered!`);
    }
  });
};

run().catch(console.error);
