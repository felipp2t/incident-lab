---
status: accepted
---

# Adotar TypeScript, Fastify e Svelte

O IncidentLab será implementado como monorepo TypeScript sobre Node.js 24, com um monólito modular Fastify e uma interface Svelte 5 estruturada por SvelteKit. O frontend será inicialmente uma SPA estática consumindo somente a API, evitando um segundo backend; Fastify oferece módulos encapsulados, validação por esquema e testes por injeção, enquanto Svelte reduz o estado e o boilerplate necessários no cliente.
