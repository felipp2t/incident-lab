---
status: accepted
---

# Desacoplar notificações do incidente

A criação e as alterações de um incidente serão confirmadas antes e independentemente das notificações externas. A necessidade de notificar será registrada de forma durável, cada canal tentará sua entrega de forma independente e falhas temporárias serão repetidas; falhas permanentes ficarão visíveis para a equipe. A timeline registrará apenas resultados operacionais relevantes, não cada tentativa técnica, e a indisponibilidade de um provedor nunca impedirá o trabalho no incidente.
