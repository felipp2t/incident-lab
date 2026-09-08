---
status: accepted
---

# Persistir outbox sem broker inicial

Toda obrigação de divulgar um acontecimento será gravada em uma outbox PostgreSQL na mesma transação da mudança que a causou. A Fatia 1 não adicionará broker, Redis nem worker permanente porque ainda não possui consumidores externos indispensáveis; o registro durável preserva o contrato e permite introduzir entrega assíncrona quando a primeira fatia consumidora a justificar.
