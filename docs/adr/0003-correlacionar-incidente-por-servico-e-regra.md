---
status: accepted
---

# Correlacionar incidente por serviço e regra

Cada combinação de serviço monitorado e regra de alerta poderá originar no máximo um incidente ativo automático. Se a mesma regra se recuperar e voltar a ficar ativa antes da resolução do incidente, a reincidência será registrada na timeline do incidente existente; uma nova ativação somente abrirá outro incidente depois que o anterior estiver resolvido. Incidentes abertos manualmente não serão reutilizados quando uma regra ficar ativa, mesmo que pertençam ao mesmo serviço, pois o sistema não pode concluir que representam o mesmo problema. Essa correlação determinística evita fragmentar uma mesma investigação sem introduzir agrupamento heurístico, e recuperação técnica não equivale a encerramento operacional.
