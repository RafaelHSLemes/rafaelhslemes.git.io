IsPicUs API (Spring Boot)

API REST com autenticação JWT, armazenamento em MongoDB (padrão) ou PostgreSQL (alternativa) e upload de imagens (S3/Cloudinary).

Quickstart
1) Java 21+ e Maven instalados.
2) Ajuste `src/main/resources/application.yml` (chaves JWT, URI do banco, provedor de upload).
3) `mvn spring-boot:run`

Endpoints (resumo)
- POST /api/auth/register, /api/auth/login
- GET /api/images/public, GET /api/images/{id}, POST /api/images (auth)
- GET /api/profiles/{username}, PATCH /api/profiles/me (auth)

Banco de dados
- Padrão: MongoDB (Spring Data Mongo). Configure `spring.data.mongodb.uri`.
- Alternativa: PostgreSQL + Spring Data JPA. Troque as dependências no `pom.xml` e as anotações das entidades conforme necessário.

Upload
- Selecione com `ispicus.upload.provider=s3|cloudinary` e configure credenciais.

