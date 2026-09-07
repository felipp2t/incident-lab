---
status: accepted
---

# Permitir desativar regras com alertas ativos

Um `admin` poderá desativar uma regra mesmo durante uma ocorrência: uma avaliação pendente será cancelada, enquanto um alerta ativo será encerrado como interrompido, nunca como recuperado. A interrupção será registrada na timeline e não resolverá o incidente associado; ao reativar a regra, uma nova avaliação começará sem reaproveitar contagens ou durações anteriores.
