---
status: accepted
---

# Controlar a atribuição do responsável principal

Qualquer `respondente` ou `admin` da organização poderá assumir um incidente sem responsável, mas somente o responsável atual poderá transferi-lo normalmente para outro membro elegível. Um `admin` poderá substituir ou remover o responsável a qualquer momento; `visualizadores` não poderão assumir nem receber essa atribuição. Se duas pessoas tentarem assumir simultaneamente um incidente livre, a primeira operação confirmada vencerá e a outra será recusada com o estado atualizado, sem sobrescrita silenciosa. Toda atribuição, transferência ou remoção confirmada será registrada uma única vez na timeline.
