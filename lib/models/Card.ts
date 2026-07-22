import mongoose, { Schema, model, models } from 'mongoose';

const CardSchema = new Schema({
  card_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
  },
  review_url: {
    type: String,
    default: '',
  },
  is_activated: {
    type: Boolean,
    default: false,
  },
  taps_count: {
    type: Number,
    default: 0,
  },
  client_name: {
    type: String,
    default: '',
  },
  client_company: {
    type: String,
    default: '',
  },
  client_phone: {
    type: String,
    default: '',
  },
  client_email: {
    type: String,
    default: '',
  },
  client_address: {
    type: String,
    default: '',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

CardSchema.pre('save', function (this: any) {
  this.updated_at = new Date();
});

// Clear cached model in development to force schema updates on hot-reload
if (process.env.NODE_ENV === 'development') {
  delete (mongoose.models as any).Card;
}

const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);

export default Card;
