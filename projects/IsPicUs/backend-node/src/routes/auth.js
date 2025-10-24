import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { asyncHandler, HttpError } from '../utils/error.js';
import User from '../models/User.js';
import Profile from '../models/Profile.js';

const router = express.Router();

const sign = (userId, exp = process.env.JWT_EXPIRES || '15m') =>
  jwt.sign({}, process.env.JWT_SECRET, { subject: String(userId), expiresIn: exp });

router.post('/register', asyncHandler(async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) throw new HttpError(400, 'Campos obrigatórios');
  const exists = await User.findOne({ $or: [{ username }, { email }] });
  if (exists) throw new HttpError(409, 'Usuário já existe');
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, passwordHash });
  await Profile.create({ user: user._id, displayName: username });
  res.status(201).json({ id: user._id, username, email });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { username, password } = req.body || {};
  const user = await User.findOne({ username });
  if (!user) throw new HttpError(401, 'Credenciais inválidas');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'Credenciais inválidas');
  const accessToken = sign(user._id);
  const refreshToken = sign(user._id, process.env.JWT_REFRESH_EXPIRES || '7d');
  res.json({ accessToken, refreshToken });
}));

export default router;

