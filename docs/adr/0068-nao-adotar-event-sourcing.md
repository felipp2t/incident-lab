---
status: accepted
---

# Não adotar event sourcing

Serviços, alertas e incidentes armazenarão seu estado atual diretamente, sem depender da reprodução de todos os eventos passados. A timeline preservará o histórico oficial do incidente e acontecimentos duráveis integrarão as áreas, mas nenhum dos dois será a única fonte usada para reconstruir o estado; eventos de integração poderão ser removidos após sua retenção operacional. Isso mantém auditabilidade e comunicação orientada a eventos sem assumir a complexidade de event sourcing.
