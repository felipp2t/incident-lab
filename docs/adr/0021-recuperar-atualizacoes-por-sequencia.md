---
status: accepted
---

# Recuperar atualizações por sequência

Cada operação durável confirmada em um incidente receberá um número crescente; uma mudança de estado e sua entrada obrigatória na timeline comporão uma única atualização nessa sequência. Mensagens, notas da timeline e demais mudanças compartilharão a mesma sequência por incidente, preservando a ordem percebida na sala; presença ficará de fora por ser efêmera. Ao reconectar, o cliente informará a última sequência recebida e obterá as posteriores; repetições serão ignoradas pelo mesmo número. Se o intervalo não puder ser recuperado, o cliente recarregará o estado completo, que continuará sendo a fonte da verdade; a sequência existe para ordenar e retomar a entrega, não para tornar o modelo event-sourced.
