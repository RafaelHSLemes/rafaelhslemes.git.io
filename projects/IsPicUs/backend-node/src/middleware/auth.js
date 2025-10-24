import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/error.js';

export const auth = (req, _res, next) => {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return next(new HttpError(401, 'Token ausente'));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub };
    return next();
  } catch {
    return next(new HttpError(401, 'Token inválido'));
  }
};

