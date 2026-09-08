# Base técnica do IncidentLab

Status: aceito para a Fatia 1

Este documento traduz a arquitetura conceitual em uma base executável mínima. Ele não antecipa infraestrutura das fatias posteriores.

## Forma da aplicação

- Monorepo simples com `pnpm workspaces`, sem orquestrador adicional.
- Node.js 24 e TypeScript em modo estrito.
- Um monólito modular em Fastify para a API e as regras do sistema.
- Uma aplicação Svelte 5 estruturada com SvelteKit e gerada como SPA estática.
- Em produção, o mesmo artefato da API poderá servir os arquivos estáticos da interface.

Os módulos do backend seguem as quatro áreas já definidas: Organizações, Monitoramento, Resposta a Incidentes e Comunicação. Eles são diretórios internos da mesma aplicação, não pacotes publicados nem serviços independentes.

Dentro da API, `core` fornece as primitivas compartilhadas de entidades e resultados, enquanto `domain/<contexto>` contém entidades, acontecimentos, casos de uso e contratos sem dependência de framework. `infra` contém HTTP, autenticação, criptografia, mappers e persistência Drizzle; factories fazem a composição na borda HTTP. A estrutura se inspira no Rootly, mas preserva em um único repositório transacional cada conjunto de confirmações atômicas definido pelo IncidentLab.

## Persistência

- PostgreSQL é a única infraestrutura persistente.
- Drizzle define o esquema, executa consultas e delimita transações.
- Migrações SQL são versionadas e aplicadas por comando explícito antes da aplicação.
- Restrições de unicidade e integridade que pertencem ao domínio também existem no banco.
- Escritas concorrentes usam versões e operações condicionais, não bloqueios mantidos pela interface.

## Acontecimentos

A mudança de estado e sua obrigação de divulgação são gravadas na mesma transação em uma outbox no PostgreSQL. Na Fatia 1 os registros já existem, mas não há broker nem processo permanente de entrega. O primeiro consumidor que exigir processamento assíncrono introduzirá o publicador mínimo necessário.

## Autenticação inicial

- A API mantém sessões opacas no PostgreSQL e envia somente um identificador em cookie `HttpOnly`, `Secure` fora do ambiente local e `SameSite=Lax`.
- Senhas são verificadas com derivação resistente e nunca armazenadas em texto puro.
- A demonstração começa com identidades provisionadas por um comando administrativo local.
- Cadastro público, convite, recuperação de senha e provedor externo ficam fora da Fatia 1.
- Autorização continua baseada no vínculo e no contexto da organização, nunca apenas na sessão.

## Interface

- SvelteKit fornece roteamento e estrutura, mas não contém regras de domínio nem endpoints próprios.
- `adapter-static` produz uma SPA que consome somente a API Fastify.
- Estado local usa os recursos do Svelte; nenhuma biblioteca global de estado é adicionada inicialmente.
- Formulários usam recursos nativos do navegador e apresentam os erros estruturados devolvidos pela API.

O modo SPA é adequado ao painel autenticado. A estratégia da página pública será decidida na fatia correspondente, onde desempenho inicial e indexação passam a ser requisitos reais.

## Verificação

- O runner nativo do Node verifica domínio e aplicação.
- `fastify.inject` verifica os contratos HTTP sem abrir uma porta de rede.
- Testes de persistência usam PostgreSQL real e isolado.
- Playwright será introduzido somente quando existir a primeira jornada visual integrada que justifique baixar os navegadores.

## Ambiente local

- API e frontend executam diretamente com Node e pnpm.
- Docker Compose fornece apenas PostgreSQL.
- Redis, BullMQ, broker, cache distribuído, microsserviços, Nx e Turborepo não fazem parte da base inicial.

## Licenças

As dependências diretas iniciais foram aprovadas pelo gate local: MIT ou Apache-2.0. Avisos de licença e `NOTICE` aplicáveis devem ser preservados. A árvore transitiva deve ser reavaliada sempre que o lockfile mudar.

`lightningcss`, transitivo do Vite, usa MPL-2.0 e permanece somente como ferramenta de build, sem modificação ou redistribuição isolada. `esbuild@0.18.20`, transitivo do `drizzle-kit`, possui uma vulnerabilidade moderada restrita ao servidor de desenvolvimento que não é usado pelo projeto; sua remoção depende da atualização segura dessa cadeia. Scripts de instalação são permitidos somente para `esbuild` no lockfile vigente.
