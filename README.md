# OrderFlow 🛒

OrderFlow is a microservices-based order management system built with Node.js, Kafka, MongoDB, and Docker. It enables real-time order tracking, client/admin role separation, and modular services for payment, shipping, packing, and notifications.

## 🚀 Features

- Microservices architecture using Kafka for communication
- Node.js backend with Express for each service
- MongoDB for storing orders and user data
- JWT-based authentication for login/signup
- Admin dashboard for managing orders
- Client dashboard to place and track orders
- Real-time order status updates and delivery progress
- Responsive frontend UI built with HTML/CSS/JS
- Dockerized services for easy deployment

## 🛠️ Tech Stack

- Node.js + Express
- Kafka (with KafkaJS)
- MongoDB + Mongoose
- Docker + Docker Compose
- HTML + CSS + JavaScript (Frontend)

## 📦 Services

- **Order Service**: Handles placing, updating, and retrieving orders
- **Auth Service**: User authentication and role management
- **Payment Service**: Processes payment and updates order status
- **Packing Service**: Simulates order packing and triggers shipment
- **Shipping Service**: Handles shipping logic and tracks delivery
- **Notification Service**: Sends email alerts when order status changes

## 🧪 How to Run

```bash
git clone https://github.com/yourusername/orderflow.git
cd orderflow
docker-compose up --build
```

Make sure Docker and Kafka are running on your machine.

## ✨ Live Demo

You can try out the live frontend at:
```
http://localhost:5500/index.html
```

## 📄 License

MIT License
