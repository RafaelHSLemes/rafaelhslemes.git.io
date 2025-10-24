IsPicUs – Portfólio de Imagens

Projeto monorepo com frontend para GitHub Pages (modo visitante) e duas opções de backend reais para autenticação JWT, perfis e upload de imagens.

- Frontend (GH Pages): `docs/` — site estático com React via CDN, cards com filtros, tema claro/escuro, carrossel e transições suaves. Integra com API real quando configurada via `docs/config.js`.
- Backend Node/Express (MERN): `backend-node/` — API com JWT, MongoDB, perfis e upload (S3 ou Cloudinary).
- Backend Spring Boot: `backend-spring/` — API com JWT, Mongo/PostgreSQL, upload (S3 ou Cloudinary).

Estrutura pensada para boas práticas: separação de camadas, validações, variáveis de ambiente, documentação e exemplos.

Como publicar no GitHub Pages
- Use o diretório `docs/` como raiz do Pages no repositório.
- Edite `docs/config.js` para apontar `ISPICUS_API_BASE` à sua API quando estiver no ar.

Backends (resumo)
- Node/Express: ver `backend-node/README.md` para configurar `.env`, MongoDB e upload (S3/Cloudinary).
- Spring Boot: ver `backend-spring/README.md` para configurar `application.yml`, banco (Mongo ou Postgres) e upload.

Fluxo sugerido
1) Subir API (Node ou Spring) em ambiente público (Render/Fly/EC2/etc.).
2) Ajustar `docs/config.js` com a URL pública.
3) Publicar GitHub Pages apontando para `docs/`.

