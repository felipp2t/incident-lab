---
status: accepted
---

# Classificar resultados de health check

Cada horário de health check produzirá no máximo uma tentativa, sem repetição imediata no MVP, classificada como saudável, falha observada do alvo ou lacuna de monitoramento. Falhas ocorridas durante a tentativa específica — resolução de nome, conexão, canal seguro, tempo de resposta, status ou conteúdo inesperado — serão atribuídas ao alvo; incapacidade do IncidentLab de executar uma tentativa confiável — executor indisponível, erro interno, sobreposição ou encerramento — reduzirá a cobertura e poderá tornar o estado desconhecido, mas não indicará indisponibilidade do serviço.
