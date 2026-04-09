import mongoose, { Schema, model, models } from 'mongoose';

const AnalyticsSchema = new Schema({
  card_id: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  device: {
    type: String,
  },
  ip: {
    type: String,
  },
  userAgent: {
    type: String,
  },
});

const Analytics = models.Analytics || model('Analytics', AnalyticsSchema);

export default Analytics;
