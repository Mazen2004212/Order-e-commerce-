const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  id: Number,
  customerId: Number,
  items: [String],
  status: { type: String, default: "Pending" }
});

module.exports = mongoose.model("Order", orderSchema);
