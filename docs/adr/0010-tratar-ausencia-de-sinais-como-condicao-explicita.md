---
status: accepted
---

# Tratar ausência de sinais como condição explícita

A ausência de sinais externos somente poderá ativar um alerta quando a fonte possuir uma frequência esperada configurada; sem esse contrato, o silêncio representará estado desconhecido, não saúde nem indisponibilidade. Health checks executados pelo IncidentLab são diferentes porque cada tentativa prevista produz explicitamente um sucesso ou uma falha, inclusive quando não há resposta.
