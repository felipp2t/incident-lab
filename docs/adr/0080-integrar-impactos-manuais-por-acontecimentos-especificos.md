---
status: accepted
---

# Integrar impactos manuais por acontecimentos específicos

Resposta a Incidentes comunicará a declaração, alteração e encerramento do impacto operacional de incidentes manuais por acontecimentos específicos, em vez de expor seus dados para consulta ou exigir que Monitoramento interprete um `IncidenteAlterado` genérico. Monitoramento consumirá esses fatos de forma idempotente e continuará sendo o único responsável por agregar os impactos e determinar o estado operacional do serviço. Isso preserva a propriedade de cada área e evita acoplar o cálculo de saúde a mudanças irrelevantes do ciclo do incidente.
