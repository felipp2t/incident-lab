---
status: accepted
---

# Separar históricos interno e público

O histórico interno de disponibilidade será calculado a partir do estado operacional interno, enquanto o histórico exibido na página de status usará somente o estado público. Períodos privados ou desconhecidos internamente não reduzirão a disponibilidade pública; quando um incidente for publicado depois de iniciado, seu impacto poderá começar no horário real mediante autorização. Correções administrativas recalcularão apenas a visão pública, preservando o registro interno.
