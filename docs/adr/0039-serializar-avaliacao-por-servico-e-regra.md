---
status: accepted
---

# Serializar avaliação por serviço e regra

Os sinais aplicáveis a uma mesma combinação de serviço e regra serão avaliados sequencialmente, de modo que contagens, durações e transições nunca sejam alteradas simultaneamente. Combinações diferentes continuarão independentes e poderão ser processadas em paralelo; sinais atrasados não reescreverão o estado atual e cada sinal aceito produzirá no máximo uma alteração em cada avaliação aplicável.
