---
status: accepted
---

# Usar notificações internas e e-mail no MVP

O MVP usará uma caixa interna persistente para incidentes de qualquer severidade e e-mail para incidentes `high` e `critical`; atualizações em tempo real não constituirão um canal de notificação. Abertura, escalada relevante, atribuição direta e resolução serão os gatilhos, com destinatários e canais independentes. Cada entrega terá identidade e ciclo próprios, será repetida após falha temporária, cancelada se o destinatário perder elegibilidade e marcada como falha permanente ao esgotar as tentativas; SMS, push, chat corporativo e webhooks ficam para evoluções futuras.
