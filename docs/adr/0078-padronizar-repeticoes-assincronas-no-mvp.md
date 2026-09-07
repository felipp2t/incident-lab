---
status: accepted
---

# Padronizar repetições assíncronas no MVP

Falhas temporárias em acontecimentos internos e e-mails terão uma tentativa inicial e cinco repetições, previstas para 1, 5, 15, 60 e 360 minutos após a primeira falha, sempre com a mesma identidade. Ao esgotar a política, um acontecimento interno será isolado sem descarte e pausará apenas sua entidade; um e-mail ficará como falha permanente sem afetar o incidente. Erros reconhecidamente permanentes não serão repetidos, e health checks, entradas recusadas e comandos reenviados pelo cliente permanecem fora dessa política.
