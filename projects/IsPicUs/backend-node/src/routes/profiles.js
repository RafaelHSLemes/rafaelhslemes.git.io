import express from 'express';
import { asyncHandler, HttpError } from '../utils/error.js';
import { auth } from '../middleware/auth.js';
import Profile from '../models/Profile.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/:username', asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) throw new HttpError(404, 'Usuário não encontrado');
  const profile = await Profile.findOne({ user: user._id });
  res.json({ username: user.username, profile });
}));

router.patch('/me', auth, asyncHandler(async (req, res) => {
  const { displayName, bio, avatarUrl, socials } = req.body || {};
  const profile = await Profile.findOneAndUpdate(
    { user: req.user.id },
    { $set: { displayName, bio, avatarUrl, socials } },
    { new: true, upsert: true }
  );
  res.json(profile);
}));

export default router;

