---
status: accepted
---

# Integrar áreas por acontecimentos

Cada área alterará somente os dados que controla e comunicará fatos relevantes como acontecimentos duráveis. Monitoramento informará ativação e recuperação de alertas; Resposta a Incidentes decidirá e registrará incidentes idempotentemente; Comunicação reagirá a mudanças do incidente sem modificá-lo. Uma falha em reação posterior não desfazerá o fato original, e esses limites serão lógicos dentro da mesma aplicação, sem exigir microsserviços.
