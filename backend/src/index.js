"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
exports.default = app;
//# sourceMappingURL=index.js.map