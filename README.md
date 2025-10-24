# Chat em tempo real (React + Supabase + Edge + Resend)

Este monorepo entrega um chat público para seu portfólio, com painel admin protegido (GitHub OAuth via Supabase Auth), mensagens em tempo real (Realtime), e notificações por e-mail (Resend). Front-end é uma SPA React hospedável no GitHub Pages.

## Estrutura
- `app/` — React SPA (Vite + TypeScript + Tailwind + Framer Motion + Recharts)
- `supabase/migrations/` — schema SQL, índices e políticas RLS
- `supabase/functions/notify-new-message` — envia e-mail ao admin com debounce
- `supabase/functions/admin-reply` — valida admin, posta resposta e notifica
- `supabase/functions/issue-visitor-token` — emite JWT curto com claim `visitor_id` (necessário p/ RLS por visitante)
- `supabase/functions/transcript-digest` — envia transcrição a cada N minutos (cron)

## Requisitos
- Supabase (Postgres + Realtime + Auth GitHub)
- Edge Functions (Deno)
- Resend (domínio verificado)
- Cloudflare Turnstile (captcha)
- GitHub Pages

## Variáveis de ambiente
Veja `.env.example`. Para desenvolvimento local do front, crie `app/.env` com:
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TURNSTILE_SITE_KEY`
- `VITE_BASE_PATH=/REPO/` (ajuste ao seu repositório GH Pages)

No projeto Supabase (Edge Functions):
- `RESEND_API_KEY`, `TURNSTILE_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_EMAIL_DESTINATION`, `SITE_BASE_URL`

## Setup
1) Criar projeto Supabase, aplicar migrações, ligar RLS, cadastrar admins
- No Studio, SQL Editor: rode os arquivos em `supabase/migrations/` na ordem.
- Certifique-se que as extensões `pgcrypto` e `uuid-ossp` estão ativas (gen_random_uuid).
- Insira seu usuário em `admins(user_id)` após primeiro login.

2) Configurar Auth GitHub (OAuth)
- Em Supabase > Authentication > Providers > GitHub: configure Client ID/Secret.
- Callback: `https://SEU_GITHUB_USERNAME.github.io/REPO/` (usa HashRouter, então raiz é suficiente).

3) Deploy das Edge Functions e envs
- Instale `supabase` CLI localmente.
- Configure as envs das funções: `supabase functions secrets set ...`
- Publique funções: `supabase functions deploy notify-new-message`, `admin-reply`, `issue-visitor-token`, `transcript-digest`.
- (Opcional) Agende digest a cada 5 min em Functions → Schedules (ou CLI):
  - Cron: `*/5 * * * *`
  - Target: `transcript-digest`
  - Envs exigidos: `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL_DESTINATION` e opcional `DIGEST_WINDOW_MINUTES`.

4) Configurar Resend
- Verifique domínio, configure DKIM e obtenha `RESEND_API_KEY`.

5) Configurar Turnstile
- Crie site key e secret key. Coloque a site key no `app/.env` e a secret nas envs das funções.

6) Front-end
- Instale deps: `npm install` na raiz (usa workspace) ou `cd app && npm install`.
- Dev: `npm run dev`
- Build: `npm run build`
- Preview: `npm run preview`
- Deploy GH Pages: `npm run deploy:gh`

## Fluxo de segurança e RLS
- Visitante: geramos/lemos `visitor_id` (UUID) no browser. No primeiro carregamento, a SPA chama a Edge `issue-visitor-token` que retorna um JWT curto assinado com claim `visitor_id`. O cliente usa este token via header `Authorization` para todas as operações. Políticas RLS fazem match por claim.
- Admin: login via GitHub OAuth. Políticas concedem total acesso quando `is_admin = true` no JWT (se presente) ou quando `auth.uid()` ∈ `admins` (fallback).

Observação: Supabase não inclui `visitor_id` por padrão no JWT anônimo; por isso fornecemos `issue-visitor-token` para emitir um JWT curto exclusivo por visitante. Você pode ajustar o TTL conforme sua preferência.

## Testes de aceitação (Checklist)
- Visitante abre `/` e envia mensagem após resolver captcha; mensagem aparece no chat e notifica admin por e-mail (com debounce de ~10–15min por conversa).
- Admin faz login em `/#/login` e acessa `/#/admin`; vê lista de conversas ordenadas por `last_event_at` desc, filtra por status, busca por texto; abre conversa e responde; visitante vê em tempo real; se conversa tem `email`, visitante recebe e-mail.
- Métricas mostram contagem de conversas abertas, mensagens por dia e TMR (tempo médio de primeira resposta).
- Tema claro/escuro persistente; navegação via teclado e foco visível.

## Deploy no GitHub Pages
- Ajuste `VITE_BASE_PATH` em `app/.env` para `/<REPO>/`.
- Execute `npm run build` e `npm run deploy:gh`. Isso publica `app/dist` na branch `gh-pages` do repositório atual.

## Scripts
- `npm run dev` — Vite dev server da SPA
- `npm run build` — build de produção da SPA
- `npm run preview` — preview local da SPA
- `npm run deploy:gh` — publica em `gh-pages`

## Notas
- Realtime: inscrição em `postgres_changes` na tabela `messages` filtrando por `conversation_id`.
- Rate limit: front faz throttle (1 msg/2s). Edge functions validam bursts e captcha quando necessário.
- Sanitização: renderização escapa texto; links com `rel=\"noopener noreferrer\"`.
