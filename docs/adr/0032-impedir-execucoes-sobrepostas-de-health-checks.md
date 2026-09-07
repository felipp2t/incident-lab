---
status: accepted
---

# Impedir execuções sobrepostas de health checks

Cada health check terá no máximo uma execução ativa, e seu tempo limite configurado deverá ser menor que o intervalo entre verificações. Se um novo horário chegar enquanto a tentativa anterior ainda estiver ativa, outra não será iniciada e o atraso será registrado para observabilidade; ao atingir o tempo limite, a tentativa terminará com resultado classificado como falha do alvo ou do monitoramento conforme a causa. Isso evita acúmulo e resultados fora de ordem.
