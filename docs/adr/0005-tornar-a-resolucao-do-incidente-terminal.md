---
status: accepted
---

# Tornar a resolução do incidente terminal

Um incidente resolvido não poderá ser reaberto. Se o problema retornar após a resolução, será criado um novo incidente, preservando timelines e métricas independentes; antes da resolução, um incidente em monitoramento poderá voltar para investigação quando houver reincidência ou nova evidência. Um incidente aberto poderá ser resolvido diretamente para atender falsos positivos, duplicidades e correções imediatas, desde que a autoria e o motivo sejam registrados na timeline.

As transições permitidas serão:

- `aberto → investigando`;
- `aberto → resolvido`;
- `investigando → monitorando`;
- `investigando → resolvido`;
- `monitorando → investigando`;
- `monitorando → resolvido`.

Nenhum estado intermediário será obrigatório, e toda transição será registrada na timeline.
