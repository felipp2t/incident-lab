---
status: accepted
---

# Organizar a API por domínio e infraestrutura

A API separará `core`, `domain/<contexto>` e `infra`, seguindo a forma já conhecida no projeto Rootly. O domínio usará entidades, agregados, identidades próprias, acontecimentos, `Either`, casos de uso e contratos de repositório; HTTP, autenticação, mappers e Drizzle permanecerão nas bordas, montados por factories. Diferentemente de operações fragmentadas entre vários repositórios, comandos com obrigações atômicas usarão uma implementação de repositório que preserve toda a transação exigida pelo IncidentLab.
