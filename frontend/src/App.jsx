import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts';
import { Cloud, Wind, Thermometer, AlertTriangle, CheckCircle, Activity, Loader2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5001/api';

function App() {
  const [formData, setFormData] = useState({
    pm25: '',
    pm10: '',
    temperature: ''
  });
  
  const [prediction, setPrediction] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`);
      setHistory(response.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, {
        pm25: Number(formData.pm25),
        pm10: Number(formData.pm10),
        temperature: Number(formData.temperature)
      });
      
      setPrediction(response.data);
      fetchHistory(); // Refresh history
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to get prediction. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getAqiColor = (aqi) => {
    if (aqi <= 50) return 'text-green-500';
    if (aqi <= 100) return 'text-yellow-500';
    if (aqi <= 150) return 'text-orange-500';
    if (aqi <= 200) return 'text-red-500';
    if (aqi <= 300) return 'text-purple-500';
    return 'text-rose-900';
  };
  
  const getAqiBgColor = (aqi) => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-purple-500';
    return 'bg-rose-900';
  };

  const getHealthSuggestion = (category) => {
    switch (category) {
      case 'Good':
        return 'Air quality is considered satisfactory, and air pollution poses little or no risk.';
      case 'Moderate':
        return 'Air quality is acceptable; however, there may be a moderate health concern for a very small number of people.';
      case 'Unhealthy for Sensitive Groups':
        return 'Members of sensitive groups may experience health effects. The general public is not likely to be affected.';
      case 'Unhealthy':
        return 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.';
      case 'Very Unhealthy':
        return 'Health alert: everyone may experience more serious health effects.';
      case 'Hazardous':
        return 'Health warnings of emergency conditions. The entire population is more likely to be affected.';
      default:
        return '';
    }
  };

  // Prepare chart data (reverse to show chronological order)
  const chartData = [...history].reverse().map(item => ({
    date: new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    aqi: item.aqi,
    pm25: item.pm25,
    pm10: item.pm10,
    temp: item.temperature
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Navbar / Header */}
      <header className="bg-gradient-to-r from-teal-600 to-cyan-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Cloud className="h-8 w-8" />
              <h1 className="text-2xl font-bold tracking-tight">EcoAir Predictor</h1>
            </div>
            <div className="text-teal-100 text-sm hidden md:block">
              Machine Learning Powered AQI Analysis
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        
        {/* Top Section: Form and Result */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 transition-all duration-300 hover:shadow-2xl">
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-teal-600" />
                  Environmental Parameters
                </h2>
                <p className="text-sm text-slate-500 mt-1">Enter current readings to predict AQI.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PM2.5 (µg/m³)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Wind className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      name="pm25"
                      required
                      value={formData.pm25}
                      onChange={handleInputChange}
                      className="pl-10 block w-full border-slate-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm border py-2.5 transition-colors"
                      placeholder="e.g. 35.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">PM10 (µg/m³)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Wind className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      name="pm10"
                      required
                      value={formData.pm10}
                      onChange={handleInputChange}
                      className="pl-10 block w-full border-slate-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm border py-2.5 transition-colors"
                      placeholder="e.g. 50.2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Temperature (°C)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Thermometer className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      name="temperature"
                      required
                      value={formData.temperature}
                      onChange={handleInputChange}
                      className="pl-10 block w-full border-slate-300 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 sm:text-sm border py-2.5 transition-colors"
                      placeholder="e.g. 25.4"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="text-sm text-red-700 mt-1">{error}</div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                      Analyzing Data...
                    </>
                  ) : (
                    'Predict Air Quality'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Result Card */}
          <div className="lg:col-span-7">
            {prediction ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden h-full flex flex-col relative border border-slate-100">
                <div className={`h-3 w-full ${getAqiBgColor(prediction.aqi)}`}></div>
                <div className="p-8 flex-1 flex flex-col items-center justify-center text-center">
                  <h3 className="text-xl font-medium text-slate-500 mb-2">Predicted Air Quality Index</h3>
                  
                  <div className={`text-7xl font-bold tracking-tighter my-4 ${getAqiColor(prediction.aqi)}`}>
                    {prediction.aqi}
                  </div>
                  
                  <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wide mb-6 ${getAqiBgColor(prediction.aqi)} text-white`}>
                    {prediction.category}
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 max-w-md">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-teal-500 mt-0.5 flex-shrink-0" />
                      <p className="ml-3 text-sm text-slate-600 text-left">
                        <span className="font-semibold text-slate-800 block mb-1">Health Advice</span>
                        {getHealthSuggestion(prediction.category)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 p-8">
                <Cloud className="w-16 h-16 mb-4 text-slate-200" />
                <p className="text-lg font-medium text-slate-500 mb-1">Awaiting Data</p>
                <p className="text-sm text-center max-w-sm">Submit the environmental parameters on the left to see the AQI prediction and health recommendations.</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">AQI Trend</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="aqi" stroke="#0d9488" strokeWidth={3} dot={{r: 4, fill: '#0d9488', strokeWidth: 2, stroke: '#fff'}} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Feature Comparison</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(-5)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{fill: '#f1f5f9'}}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}/>
                    <Bar dataKey="pm25" name="PM 2.5" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pm10" name="PM 10" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="temp" name="Temperature" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
