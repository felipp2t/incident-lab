---
status: accepted
---

# Não reproduzir health checks perdidos

Verificações não executadas durante uma indisponibilidade do monitor não serão reproduzidas depois, pois não permitem reconstruir retroativamente a saúde do alvo e poderiam sobrecarregá-lo. O período será registrado como uma lacuna de monitoramento e poderá tornar o estado desconhecido; ao retornar, o executor fará uma verificação atual e retomará o intervalo normal, mantendo uma métrica das execuções perdidas.
