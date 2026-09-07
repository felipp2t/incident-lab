---
status: accepted
---

# Definir semântica temporal dos sinais

Cada sinal preservará o instante observado na origem e o instante recebido pelo IncidentLab. Fontes com frequência esperada terão frescor padrão de três vezes essa frequência, configurável por fonte; sinais anteriores ao ponto já avaliado serão preservados como atrasados sem reordenar nem alterar o estado atual. Instantes até um minuto no futuro serão aceitos como desvio de relógio, mas a avaliação os limitará ao instante de recebimento; desvios maiores serão rejeitados. A validade temporal para avaliação será determinada na aceitação, de modo que atraso posterior no processamento interno não invalide evidências já aceitas; um corte administrativo posterior, como o arquivamento definido no ADR 0086, ainda pode encerrar o processamento sem avaliação.
