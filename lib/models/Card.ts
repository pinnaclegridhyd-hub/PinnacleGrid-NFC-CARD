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

const Card = models.Card || model('Card', CardSchema);

export default Card;
