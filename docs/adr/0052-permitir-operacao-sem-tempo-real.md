---
status: accepted
---

# Permitir operação sem tempo real

Indisponibilidade do canal em tempo real não impedirá leituras, comandos nem mensagens persistidas. A interface indicará a degradação e poderá atualizar dados manual ou periodicamente; presença ficará indisponível sem afetar o incidente. Quando o canal retornar, a sequência por incidente recuperará as atualizações perdidas, mantendo tempo real como melhoria de experiência e não como requisito operacional.
