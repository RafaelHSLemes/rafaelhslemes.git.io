import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  displayName: { type: String },
  bio: { type: String, maxlength: 500 },
  avatarUrl: { type: String },
  socials: {
    instagram: String,
    twitter: String,
    website: String
  }
}, { timestamps: true });

export default mongoose.model('Profile', profileSchema);

