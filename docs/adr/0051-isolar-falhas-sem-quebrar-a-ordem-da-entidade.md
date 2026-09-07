---
status: accepted
---

# Isolar falhas sem quebrar a ordem da entidade

Depois de um limite de tentativas, um acontecimento que continue falhando será isolado para intervenção e os acontecimentos posteriores da mesma entidade ficarão pausados para preservar sua ordem. Outras entidades continuarão sendo processadas normalmente; depois de corrigida a causa, o item isolado será reenviado com a mesma identidade e liberará os seguintes. Nenhum acontecimento será descartado silenciosamente, e uma falha localizada não bloqueará o sistema inteiro.
