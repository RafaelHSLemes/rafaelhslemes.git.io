# TaskBoard – SargentTasks

Portfólio front-end com React (Vite) + Framer Motion exibindo um TaskBoard (Pendente, Em Progresso, Concluída). Persistência em localStorage e opção de alternar para API mock (MockAPI/JSON Server/Render). Preparado para GitHub Pages.

## Destaques
- React com hooks e Context API para estado global.
- Animações suaves de status com Framer Motion.
- Persistência local (localStorage) por padrão; API remota opcional via `VITE_API_BASE_URL`.
- Build preparado para GitHub Pages (base `/projects/SargentTasks/`, saída em `docs/`).

## Estrutura do Projeto
- `index.html`: Entrada da aplicação (Vite) e SEO básico.
- `vite.config.ts`: Base e `outDir` configurados para GitHub Pages.
- `package.json`: Scripts de dev, build e preview.
- `tsconfig.json`: Configuração TypeScript strict.
- `src/`
  - `main.tsx`: Bootstrap do React + Provider.
  - `types.ts`: Tipos de domínio (`Task`, `TaskStatus`).
  - `utils/api.ts`: Camada de API com fallback para localStorage.
  - `state/TaskContext.tsx`: Context API (carregar, criar, atualizar, excluir, refresh).
  - `ui/`
    - `App.tsx`: Layout principal.
    - `index.css`: Estilos leves e responsivos.
    - `components/`
      - `TaskForm.tsx`: Formulário controlado (criação de tarefas).
      - `Board.tsx`: Board com colunas por status e animações.
      - `Column.tsx`: Container de coluna.
      - `TaskCard.tsx`: Card com mudança de status e exclusão.

## Status e Modelo
- Status: `Pendente`, `Em Progresso`, `Concluída`.
- Modelo `Task`: `id`, `title`, `description`, `status`, `createdAt`, `updatedAt`.

## Como Rodar Localmente
- Pré‑requisitos: Node.js 18+ e npm.
- Instalar deps: `npm install`
- Desenvolvimento: `npm run dev` (abre no http://localhost:5173)
- Build estático: `npm run build` (gera conteúdo em `docs/`)
- Preview: `npm run preview`

## Alternando para API Mock (Opcional)
- Defina a URL da API em um `.env` local:
  - `VITE_API_BASE_URL=https://sua-api.mock/v1`
- Endpoints esperados:
  - `GET /tasks` → Task[]
  - `POST /tasks` → Task criado
  - `PUT /tasks/:id` → Task atualizado
  - `DELETE /tasks/:id` → 204
- Dicas rápidas:
  - JSON Server: `npx json-server --watch db.json --port 3001`
  - Render/Glitch: publique um pequeno backend Express com estes endpoints.

## Deploy no GitHub Pages
- O projeto já está configurado com base `/projects/SargentTasks/` e saída `docs/`.
- Passos:
  - `npm install && npm run build`
  - Commit e push do conteúdo gerado em `docs/` junto ao código.
  - Garanta que o repositório raiz (rafaelhslemes.git.io) esteja publicado e sirva arquivos do caminho `projects/SargentTasks/`.

## Personalização Rápida
- Paleta/tema: edite `src/ui/index.css`.
- Títulos/links: edite `src/ui/App.tsx`.
- Campos extras em Task: ajuste `src/types.ts`, `TaskForm.tsx` e `TaskCard.tsx`.

## Próximos Passos (Stretch)
- Drag‑and‑drop de cards entre colunas.
- Filtros por título/status e busca.
- Sincronização opcional com backend Java Spring Boot ou MERN.

