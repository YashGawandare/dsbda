from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os

app = Flask(__name__)

# Load model
model_path = 'model.joblib'
if os.path.exists(model_path):
    model = joblib.load(model_path)
else:
    model = None

@app.route('/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'error': 'Model not trained yet.'}), 500
    
    try:
        data = request.json
        # Expected inputs: pm2.5, pm10, temperature
        # But we'll try to extract them, defaulting to 0 if missing
        pm25 = float(data.get('pm2.5', 0))
        pm10 = float(data.get('pm10', 0))
        temp = float(data.get('temperature', 0))
        
        # In a real scenario, you'd handle NO2, SO2, etc., 
        # but our model is trained only on these 3 features based on the dataset
        
        features = pd.DataFrame([{
            'pm2.5': pm25,
            'pm10': pm10,
            'temperature': temp
        }])
        
        prediction = model.predict(features)[0]
        
        # Calculate AQI Category
        category = "Good"
        if prediction <= 50:
            category = "Good"
        elif prediction <= 100:
            category = "Moderate"
        elif prediction <= 150:
            category = "Unhealthy for Sensitive Groups"
        elif prediction <= 200:
            category = "Unhealthy"
        elif prediction <= 300:
            category = "Very Unhealthy"
        else:
            category = "Hazardous"
            
        return jsonify({
            'aqi': round(prediction, 2),
            'category': category
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/metrics', methods=['GET'])
def get_metrics():
    metrics_path = 'metrics.json'
    if os.path.exists(metrics_path):
        import json
        with open(metrics_path, 'r') as f:
            return jsonify(json.load(f))
    return jsonify({'error': 'Metrics not found.'}), 404

if __name__ == '__main__':
    app.run(port=5000, debug=True)
