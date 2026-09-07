---
status: accepted
---

# Não reavaliar o estado com sinais atrasados

Todo sinal registrará o instante em que foi observado na origem e o instante em que foi recebido pelo IncidentLab. Um sinal anterior ao ponto já alcançado pela avaliação será armazenado e marcado como atrasado para auditoria e observabilidade, mas não alterará retroativamente o estado atual do alerta; sinais com horários excessivamente no futuro serão rejeitados. Essa escolha favorece uma visão operacional estável sem exigir o recálculo de todo o histórico.
