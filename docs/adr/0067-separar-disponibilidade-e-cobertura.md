---
status: accepted
---

# Separar disponibilidade e cobertura

Períodos em estado `desconhecido` não serão classificados como disponíveis nem indisponíveis. O sistema apresentará separadamente a disponibilidade, calculada dentro do período com observações confiáveis, e a cobertura do monitoramento, que informa quanto do tempo total possui dados válidos. Essa separação evita inflar a saúde durante lacunas e também evita atribuir ao serviço uma queda que pertence ao monitoramento.
