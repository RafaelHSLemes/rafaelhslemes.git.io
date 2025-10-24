import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  title: { type: String, required: true },
  url: { type: String, required: true },
  thumbUrl: { type: String },
  author: { type: String },
  tags: { type: [String], index: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Image', imageSchema);

