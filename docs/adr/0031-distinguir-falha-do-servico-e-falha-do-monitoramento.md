---
status: accepted
---

# Distinguir falha do serviço e falha do monitoramento

Uma verificação executada cujo alvo não responda conforme esperado produzirá uma falha do serviço monitorado; a incapacidade do IncidentLab de executar a verificação produzirá uma falha do monitoramento e não será atribuída ao alvo. Sem verificações recentes confiáveis, o estado do serviço será desconhecido, enquanto falhas internas gerarão alertas sobre o próprio IncidentLab para evitar uma cascata de incidentes falsos nos serviços acompanhados.
