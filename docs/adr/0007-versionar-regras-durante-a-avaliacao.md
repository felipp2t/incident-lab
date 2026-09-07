---
status: accepted
---

# Versionar regras durante a avaliação

Cada avaliação usará uma versão imutável da regra de alerta. Alterar sua condição, limite ou duração encerrará qualquer estado pendente da versão anterior e iniciará uma nova avaliação; um alerta já ativo continuará sendo avaliado exclusivamente pela versão que o originou até ser recuperado ou interrompido, sem executar duas versões da mesma regra em paralelo. Incidentes existentes e suas timelines preservarão a configuração original, e a nova versão valerá na próxima avaliação sem alerta ativo.
