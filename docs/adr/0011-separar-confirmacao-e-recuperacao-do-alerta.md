---
status: accepted
---

# Separar confirmação e recuperação do alerta

Uma regra definirá separadamente sua condição de ativação e sua condição de recuperação, ambas expressas por quantidade consecutiva ou duração. Enquanto o alerta estiver pendente, qualquer sinal que não viole a condição reiniciará o progresso de ativação; depois que estiver ativo, sinais saudáveis somente o tornarão recuperado quando satisfizerem a recuperação configurada. Isso reduz ativações e recuperações causadas por oscilações isoladas.
