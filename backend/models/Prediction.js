const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  pm25: { type: Number, required: true },
  pm10: { type: Number, required: true },
  temperature: { type: Number, required: true },
  aqi: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', predictionSchema);
