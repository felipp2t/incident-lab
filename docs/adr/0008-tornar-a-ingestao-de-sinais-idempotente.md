---
status: accepted
---

# Tornar a ingestão de sinais idempotente

Cada sinal enviado por uma fonte externa possuirá um identificador definido na origem, cuja combinação com a fonte de sinais será única. A primeira entrega será armazenada e avaliada; entregas posteriores idênticas serão reconhecidas e contabilizadas, mas não produzirão nova avaliação. Se o mesmo identificador for reutilizado pela mesma fonte com conteúdo diferente, a entrega será rejeitada como conflito, pois uma repetição de transporte não pode alterar um fato já aceito.
