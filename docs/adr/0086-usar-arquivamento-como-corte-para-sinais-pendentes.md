---
status: accepted
---

# Usar arquivamento como corte para sinais pendentes

O instante de arquivamento será o corte administrativo para novas avaliações: sinais aceitos antes dele continuarão com um desfecho registrado, mas aqueles ainda não avaliados serão encerrados como não avaliados por arquivamento e não criarão alertas. Transições de alerta e obrigações de incidente já confirmadas antes do corte permanecem válidas e podem impedir o arquivamento conforme o ADR 0085; restaurar o serviço inicia avaliações novas sem reproduzir sinais ignorados. Assim, aceitação durável não vira descarte silencioso, mas também não contraria a decisão administrativa de parar o serviço.
