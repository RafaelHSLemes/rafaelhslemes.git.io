import express from 'express';
import { asyncHandler, HttpError } from '../utils/error.js';
import { auth } from '../middleware/auth.js';
import Image from '../models/Image.js';
import { makeUploader } from '../services/upload.js';

const router = express.Router();
const uploader = makeUploader();

router.get('/public', asyncHandler(async (req, res) => {
  const { q, tag, limit = 50 } = req.query;
  const filter = {};
  if (q) filter.$or = [
    { title: { $regex: q, $options: 'i' } },
    { author: { $regex: q, $options: 'i' } },
    { tags: { $regex: q, $options: 'i' } },
  ];
  if (tag) filter.tags = tag;
  const items = await Image.find(filter).sort({ createdAt: -1 }).limit(Number(limit));
  res.json({ items });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const it = await Image.findById(req.params.id);
  if (!it) throw new HttpError(404, 'Não encontrado');
  res.json(it);
}));

router.post('/', auth, uploader.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'Arquivo obrigatório');
  const { title, tags } = req.body || {};
  const url = req.file.path || req.file.location;
  const thumbUrl = url; // simplificação; gere thumbs num worker/cdn
  const created = await Image.create({
    owner: req.user.id,
    title: title || 'Sem título',
    url,
    thumbUrl,
    tags: typeof tags === 'string' ? tags.split(',').map(s => s.trim()).filter(Boolean) : (tags || []),
    author: undefined
  });
  res.status(201).json(created);
}));

router.delete('/:id', auth, asyncHandler(async (req, res) => {
  const it = await Image.findById(req.params.id);
  if (!it) throw new HttpError(404, 'Não encontrado');
  if (String(it.owner) !== String(req.user.id)) throw new HttpError(403, 'Proibido');
  await it.deleteOne();
  res.status(204).end();
}));

export default router;

