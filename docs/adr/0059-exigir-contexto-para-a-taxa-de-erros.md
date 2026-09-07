---
status: accepted
---

# Exigir contexto para a taxa de erros

Uma medição externa de `error_rate` informará a proporção entre zero e um, o período observado e a quantidade de requisições da amostra. A aplicação de origem calculará a taxa, sem enviar cada requisição individual ao IncidentLab; a regra poderá exigir um tamanho mínimo de amostra antes de considerar a medição válida. Esses dados serão preservados como contexto para não atribuir o mesmo peso a percentuais obtidos de volumes muito diferentes.
