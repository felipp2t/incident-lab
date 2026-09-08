---
status: accepted
---

# Usar PostgreSQL com Drizzle

PostgreSQL será a fonte persistente única, e Drizzle será usado para esquema, consultas, transações e migrações SQL versionadas. A combinação mantém restrições e concorrência visíveis no banco sem adicionar geração de clientes ou outra infraestrutura de dados, e permite confirmar atomicamente agregados, idempotência e outbox.
