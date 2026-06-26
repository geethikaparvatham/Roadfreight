import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { admin } from './config/firebase';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mock endpoint for ETA Prediction
app.post('/api/eta/predict', (req, res) => {
  const { distanceRemaining, averageSpeed, trafficFactor, weatherFactor } = req.body;
  // Simple ETA calculation
  const baseTime = (distanceRemaining / averageSpeed) * 60; // in minutes
  const etaMinutes = baseTime * (trafficFactor || 1) * (weatherFactor || 1);
  
  const estimatedTimeOfArrival = new Date();
  estimatedTimeOfArrival.setMinutes(estimatedTimeOfArrival.getMinutes() + etaMinutes);
  
  res.json({
    etaMinutes: Math.round(etaMinutes),
    estimatedTimeOfArrival: estimatedTimeOfArrival.toISOString()
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
