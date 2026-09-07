---
status: accepted
---

# Coordenar abertura manual e arquivamento por serviço

`AbrirIncidenteManual` e `ArquivarServico` participarão da mesma ordem exclusiva de decisão por serviço no MVP. A abertura consultará o cadastro oficial em Monitoramento, sem manter uma cópia em Resposta a Incidentes, enquanto o arquivamento consultará a existência de incidentes não resolvidos e de obrigações confirmadas de criar incidentes automáticos; se uma fonte oficial necessária estiver indisponível, o comando será recusado para nova tentativa. Assim, uma ativação já confirmada ou a primeira decisão confirmada determina o resultado da concorrente sem exigir uma transação que escreva em duas áreas.
