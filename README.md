# IncidentLab

Laboratório de detecção e resposta a incidentes. A arquitetura e o roteiro estão em [IncidentLab-Ideia-do-Projeto.md](./IncidentLab-Ideia-do-Projeto.md).

## Desenvolvimento local

Pré-requisitos: Node.js 24, pnpm 11 e Docker.

```bash
cp .env.example .env
docker compose up -d postgres
pnpm install
pnpm build
pnpm db:migrate
pnpm user:provision
pnpm dev
```

A API usa `http://localhost:3000`; o frontend informa sua URL no terminal. As credenciais iniciais vêm das variáveis `DEMO_USER_*` do arquivo `.env`.

## Verificação

```bash
pnpm check
pnpm test
pnpm test:e2e
```
