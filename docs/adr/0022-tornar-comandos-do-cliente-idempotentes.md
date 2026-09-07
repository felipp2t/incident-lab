---
status: accepted
---

# Tornar comandos do cliente idempotentes

Cada comando enviado pela interface, incluindo mensagens, transições e atribuições, possuirá um identificador único gerado pelo cliente. A repetição do mesmo comando devolverá o resultado original sem produzir nova alteração; reutilizar o identificador com conteúdo diferente será tratado como conflito. Assim, uma perda de confirmação poderá ser recuperada com nova tentativa sem duplicar a ação.
