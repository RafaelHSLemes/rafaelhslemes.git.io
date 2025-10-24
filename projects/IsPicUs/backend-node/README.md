IsPicUs API (Node/Express)

API REST com autenticação JWT, MongoDB (Mongoose), perfis e upload de imagens (S3 ou Cloudinary).

Endpoints (resumo)
- POST /api/auth/register — cria usuário
- POST /api/auth/login — retorna tokens
- GET /api/images/public — lista pública de imagens
- GET /api/images/:id — detalhe
- POST /api/images — criar (auth)
- DELETE /api/images/:id — remover (auth dono)
- GET /api/profiles/:username — perfil público
- PATCH /api/profiles/me — atualizar perfil (auth)

Configuração
1) Copie `.env.example` para `.env` e ajuste variáveis.
2) `npm install`
3) `npm run dev`

Variáveis de ambiente
- PORT=4000
- MONGO_URI=mongodb+srv://...
- JWT_SECRET=troque-esta-chave
- JWT_EXPIRES=15m
- JWT_REFRESH_EXPIRES=7d
- UPLOAD_PROVIDER=s3|cloudinary
- AWS_REGION=...  AWS_ACCESS_KEY_ID=...  AWS_SECRET_ACCESS_KEY=...  S3_BUCKET=...
- CLOUDINARY_URL=cloudinary://KEY:SECRET@CLOUD_NAME

Boas práticas aplicadas
- Validação e sanitização básicas
- Separação por camadas (routes/controllers/services)
- Tratamento de erros centralizado
- Tokens de acesso e refresh (opcional)

