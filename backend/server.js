const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const Prediction = require('./models/Prediction');
// created express object

const app = express();
const PORT = 5001;
const ML_API_URL = 'http://127.0.0.1:5000/predict';
const MONGO_URI = 'mongodb://127.0.0.1:27017/aqi_db';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// API Route for prediction
app.post('/api/predict', async (req, res) => {
  try {
    const { city, pm25, pm10, temperature } = req.body;

    // Input validation
    if (temperature < -50 || temperature > 60) {
      return res.status(400).json({ error: 'Invalid temperature value. Must be between -50°C and 60°C.' });
    }
    if (pm25 < 0 || pm25 > 2000) {
      return res.status(400).json({ error: 'Invalid PM2.5 value. Must be between 0 and 2000.' });
    }
    if (pm10 < 0 || pm10 > 2000) {
      return res.status(400).json({ error: 'Invalid PM10 value. Must be between 0 and 2000.' });
    }

    // Send data to ML model (Flask API)
    const mlResponse = await axios.post(ML_API_URL, {
      'pm2.5': pm25,
      'pm10': pm10,
      'temperature': temperature
    });

    const { aqi, category } = mlResponse.data;

    // Save prediction to MongoDB
    const newPrediction = new Prediction({
      city,
      pm25,
      pm10,
      temperature,
      aqi,
      category
    });

    await newPrediction.save();

    res.status(200).json({ city, aqi, category, prediction: newPrediction });
  } catch (error) {
    console.error('Error in prediction API:', error.message);
    res.status(500).json({ error: 'Failed to process prediction' });
  }
});

// API Route for fetching history
app.get('/api/history', async (req, res) => {
  try {
    const history = await Prediction.find().sort({ date: -1 }).limit(50);
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// API Route to clear history
app.delete('/api/history', async (req, res) => {
  try {
    await Prediction.deleteMany({});
    res.status(200).json({ message: 'History cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

// API Route for fetching model metrics
app.get('/api/metrics', async (req, res) => {
  try {
    const metricsResponse = await axios.get('http://127.0.0.1:5000/metrics');
    res.status(200).json(metricsResponse.data);
  } catch (error) {
    console.error('Error fetching metrics:', error.message);
    res.status(500).json({ error: 'Failed to fetch model metrics' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
