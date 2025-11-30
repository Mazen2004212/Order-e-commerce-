const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
const connectDB = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// الاتصال بقاعدة البيانات
connectDB();

// ✅ تسجيل الدخول
app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const user = await User.findOne({ email, role });
    if (!user) return res.status(401).json({ message: "Invalid credentials." });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Incorrect password." });

    res.json({ message: "Login successful", user: { email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ إنشاء حساب جديد
app.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: "Email already registered." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ message: "User created successfully." });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// ✅ استعادة كلمة المرور (بدون عرضها)
app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required." });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found." });

    // مفيش إظهار للباسورد - ممكن ترسل رسالة عامة
    res.json({ message: "If this email is registered, a reset link has been sent." });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

app.listen(3005, () => console.log("✅ Auth Service running on port 3005"));
