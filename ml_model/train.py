import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
import os

# Load dataset
data_path = '../16_air_quality_prediction.csv'
print(f"Loading dataset from {data_path}...")
df = pd.read_csv(data_path)

# Features and target
# Based on the provided dataset, features are pm2.5, pm10, temperature
features = ['pm2.5', 'pm10', 'temperature']
target = 'predicted_aqi'

X = df[features]
y = df[target]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Training Linear Regression...")
lr_model = LinearRegression()
lr_model.fit(X_train, y_train)
lr_preds = lr_model.predict(X_test)

import numpy as np
lr_rmse = np.sqrt(mean_squared_error(y_test, lr_preds))
lr_mae = mean_absolute_error(y_test, lr_preds)
lr_r2 = r2_score(y_test, lr_preds)

print(f"Linear Regression Metrics:")
print(f"RMSE: {lr_rmse:.4f}, MAE: {lr_mae:.4f}, R²: {lr_r2:.4f}")

print("\nTraining Random Forest Regressor...")
rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
rf_model.fit(X_train, y_train)
rf_preds = rf_model.predict(X_test)

rf_rmse = np.sqrt(mean_squared_error(y_test, rf_preds))
rf_mae = mean_absolute_error(y_test, rf_preds)
rf_r2 = r2_score(y_test, rf_preds)

print(f"Random Forest Metrics:")
print(f"RMSE: {rf_rmse:.4f}, MAE: {rf_mae:.4f}, R²: {rf_r2:.4f}")

# Compare and save the best model
if rf_r2 > lr_r2:
    best_model = rf_model
    print("\nRandom Forest is the better model. Saving...")
else:
    best_model = lr_model
    print("\nLinear Regression is the better model. Saving...")

model_filename = 'model.joblib'
joblib.dump(best_model, model_filename)
print(f"Model saved to {model_filename} successfully!")
