---
status: accepted
---

# Permitir impacto operacional em incidentes manuais

Ao abrir um incidente manual, o autor escolherá um impacto operacional entre nenhuma alteração, `degradado`, `indisponível` e `desconhecido`. Esse impacto contribuirá para o estado agregado do serviço, poderá ser alterado com registro na timeline e deixará de valer quando o incidente for resolvido. Ele permanecerá separado da severidade, permitindo comunicar uma falha não detectada automaticamente sem confundir saúde técnica com impacto organizacional.
