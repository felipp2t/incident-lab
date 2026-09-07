---
status: accepted
---

# Limitar apenas fluxos operacionais no MVP

O MVP não imporá quantidade máxima de membros, serviços, fontes, regras, incidentes ou registros históricos por organização. Os únicos limites de produto serão intervalo mínimo de 30 segundos para health checks, 120 sinais externos por minuto por fonte e 1.000 por minuto por organização. Excesso de ingestão será recusado antes da aceitação durável e poderá ser reenviado com a mesma identidade; sinais já aceitos e consequências confirmadas nunca serão abandonados. Agendamento justo e backpressure interno protegerão a execução de health checks sem criar uma cota cadastral.
