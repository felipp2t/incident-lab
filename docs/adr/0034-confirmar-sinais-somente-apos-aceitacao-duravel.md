---
status: accepted
---

# Confirmar sinais somente após aceitação durável

Um sinal somente será confirmado para a origem depois de armazenado com segurança, momento a partir do qual o IncidentLab garantirá seu processamento mesmo com atraso. Quando não puder aceitá-lo, o sistema recusará explicitamente a entrega para que a origem tente novamente com o mesmo identificador idempotente; nunca confirmará um sinal que possa perder silenciosamente. Limites por organização impedirão que uma origem monopolize a capacidade, e atrasos e recusas serão observáveis.
