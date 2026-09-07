---
status: accepted
---

# Permitir resolver com alerta ainda ativo

Um respondente poderá resolver o incidente mesmo que o alerta de origem permaneça ativo, mediante aviso explícito, categoria e nota de resolução. O alerta continuará ativo, o estado operacional do serviço continuará afetado e a timeline registrará a exceção; se o alerta recuperar depois, essa recuperação tardia também será anexada à timeline sem reabrir o incidente. A mesma ativação não abrirá outro incidente. Somente depois da recuperação e de uma ativação posterior um novo incidente poderá ser criado, evitando um ciclo infinito sem impedir o encerramento de falsos positivos ou riscos aceitos.
