import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const User = models.User || model('User', UserSchema);

export default User;
