---
status: accepted
---

# Assumir entrega repetida de acontecimentos

Acontecimentos trocados entre as áreas terão identidade própria e poderão ser entregues mais de uma vez. Consumidores registrarão o que já processaram para produzir efeito idempotente, e versões antigas nunca substituirão estado mais recente; a ordem será preservada por entidade, não globalmente. Falhas serão repetidas até o processamento ou separadas para intervenção, adotando entrega pelo menos uma vez sem prometer a garantia irreal de execução exatamente uma vez.
