# DevQuotes – Frases motivacionais de programadores

Projeto de portfólio para demonstrar domínio de fetch API, React Hooks e integração simples com backends em Node (Express) e Java (Spring Boot).

## Estrutura

- `frontend-react/` — Single Page App em React com:
  - Botão “Gerar nova frase”
  - Animação de entrada
  - Mudança de background a cada nova frase
  - Compartilhar no X (Twitter) e LinkedIn
  - Fallback local (caso API não esteja disponível no GitHub Pages)
- `backend-node/` — API Node.js/Express com rota `GET /api/quote` que retorna uma frase aleatória.
- `backend-spring/` — API Spring Boot com endpoint `GET /quote/random` que retorna uma frase aleatória.

As APIs retornam JSON no formato:

```json
{ "text": "string", "author": "string" }
```

## Como executar

### Frontend (React)

1. Entre na pasta `frontend-react` e instale dependências:
   - `npm install`
2. Configure a URL da API (opcional):
   - Por padrão, o app tenta usar `"/api/quote"` (útil quando o frontend e o backend Node servem no mesmo domínio) e faz fallback para quotes locais se falhar.
   - Para apontar explicitamente para uma API, crie um arquivo `.env` com `VITE_API_URL=http://localhost:3001/api/quote` (Node) ou `VITE_API_URL=http://localhost:8080/quote/random` (Spring).
3. Rode em desenvolvimento:
   - `npm run dev`
4. Build para produção (ex.: GitHub Pages):
   - `npm run build` e publique o conteúdo de `frontend-react/dist`.

### Backend Node (Express)

1. Entre em `backend-node`:
   - `npm install`
2. Inicie a API:
   - `npm start`
3. Endpoint disponível:
   - `GET http://localhost:3001/api/quote`

### Backend Spring Boot (Java)

1. Requisitos: JDK 17+ e Maven.
2. Entre em `backend-spring`:
   - `mvn spring-boot:run`
3. Endpoint disponível:
   - `GET http://localhost:8080/quote/random`

## Notas de Deploy (GitHub Pages)

- O GitHub Pages hospeda apenas conteúdo estático. O frontend funciona com fallback local caso a API não esteja acessível publicamente.
- Para demonstrar integração real, execute a API localmente e configure `VITE_API_URL` durante o desenvolvimento ou build.

## Boas práticas adotadas

- Separação de responsabilidades (frontend, Node API, Spring API)
- Padronização do payload `{ text, author }`
- CORS habilitado no backend Node para facilitar desenvolvimento local
- Tratamento de erro e fallback no frontend
- Hooks do React (`useEffect`, `useState`, `useCallback`) e `fetch` API

