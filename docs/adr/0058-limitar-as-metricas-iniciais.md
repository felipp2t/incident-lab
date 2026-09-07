---
status: accepted
---

# Limitar as métricas iniciais

O MVP aceitará as medições conhecidas `availability`, como valor saudável ou indisponível; `latency`, em milissegundos; `error_rate`, como proporção entre zero e um; e `heartbeat`, como confirmação de atividade da fonte. Um sinal poderá carregar várias medições e cada regra escolherá qual avaliar. Métricas personalizadas ficam adiadas porque exigiriam cadastro de tipo, unidade, validação e semântica de agregação.
