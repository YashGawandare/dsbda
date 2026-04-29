# Air Quality Prediction Dashboard

It is a full-stack air quality prediction project built with:
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + MongoDB
- **Machine Learning:** Python + scikit-learn + Flask
- **Dataset:** `16_air_quality_prediction.csv`

## Project Overview

This project predicts air quality index (AQI) values using a trained ML model and exposes the prediction functionality through a backend API. The frontend provides a user interface for submitting sensor data and viewing prediction results and history.

## Architecture

- `frontend/` - React application for UI and user interaction.
- `backend/` - Express server that validates inputs, calls the ML prediction service, saves prediction history to MongoDB, and returns results.
- `ml_model/` - Python code for training the model and serving predictions via Flask.
- `16_air_quality_prediction.csv` - Dataset used to train the regression model.

## Features

- Predict AQI from `pm2.5`, `pm10`, and `temperature` inputs
- Categorize AQI into standard air quality labels
- Persist prediction history in MongoDB
- Retrieve saved history and clear history from the backend
- Expose model metrics through an API endpoint

## Folder Details

### `frontend/`
- React + Vite application
- Uses `axios` to connect to the backend
- Includes charting and UI components for air quality predictions

### `backend/`
- Express API server
- Connects to MongoDB at `mongodb://127.0.0.1:27017/aqi_db`
- Sends prediction requests to the ML service at `http://127.0.0.1:5000/predict`
- Stores prediction records in MongoDB using Mongoose

### `ml_model/`
- `train.py` trains a regression model using `pm2.5`, `pm10`, and `temperature`
- `app.py` serves prediction and metrics endpoints via Flask
- `model.joblib` is the serialized trained model
- `metrics.json` stores model evaluation metrics

## Prerequisites

- Node.js
- npm
- Python 3
- MongoDB

## Setup

### 1. Install dependencies

From the project root:

```bash
cd frontend
npm install

cd ../backend
npm install
```

From the `ml_model` folder, install Python dependencies as needed, for example:

```bash
pip install pandas scikit-learn joblib flask
```

### 2. Start MongoDB

Ensure MongoDB is running locally on `mongodb://127.0.0.1:27017`.

### 3. Train the machine learning model (optional)

If you want to retrain the model or generate updated metrics:

```bash
cd ml_model
python train.py
```

This creates `model.joblib` and `metrics.json` in the `ml_model/` folder.

### 4. Run the ML service

```bash
cd ml_model
python app.py
```

The Flask app listens on `http://127.0.0.1:5000`.

### 5. Run the backend server

```bash
cd backend
node server.js
```

The backend listens on `http://localhost:5001`.

### 6. Run the frontend

```bash
cd frontend
npm run dev
```

Open the Vite app in the browser using the URL shown in the terminal.

## API Endpoints

### ML service (Flask)
- `POST /predict` - predicts AQI from JSON input
- `GET /metrics` - returns saved model metrics

### Backend service (Express)
- `POST /api/predict` - validates input, calls ML service, saves prediction
- `GET /api/history` - retrieves latest prediction history
- `DELETE /api/history` - clears prediction history
- `GET /api/metrics` - forwards model metrics from Flask service

## Notes

- Backend configuration values are currently hardcoded in `backend/server.js`.
- Use TSV or JSON requests with fields `city`, `pm25`, `pm10`, and `temperature` when calling the backend prediction endpoint.

## Future Improvements

- Add environment variable support for service URLs and MongoDB connection strings
- Expand dataset and features for more accurate AQI predictions
- Add authentication and better error handling
- Containerize services with Docker for easier setup
