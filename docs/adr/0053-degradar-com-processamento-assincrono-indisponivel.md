---
status: accepted
---

# Degradar com processamento assíncrono indisponível

Enquanto puderem ser armazenados com segurança, sinais e comandos continuarão sendo aceitos quando os processadores em segundo plano estiverem indisponíveis. Avaliações, incidentes automáticos, notificações e relatórios ficarão pendentes e visivelmente atrasados, enquanto incidentes manuais e ações humanas continuarão operando; ao retornar, o processamento retomará os itens duráveis em ordem. Se nem a aceitação segura for possível, novas escritas serão recusadas explicitamente.
