---
status: accepted
---

# Exigir evidências ao longo da janela

Uma regra baseada em duração somente confirmará sua condição quando receber evidências válidas ao longo da janela configurada; uma medição isolada não será presumida verdadeira indefinidamente. Quando deixarem de chegar novas observações dentro da frequência esperada, a avaliação não ativada perderá seu progresso e o estado passará a ser desconhecido, enquanto uma regra separada de ausência de sinais poderá detectar o silêncio. Se o alerta já estiver ativo, a ausência de novas observações não será tratada como recuperação: alerta e incidente permanecerão ativos até haver evidência suficiente de saúde ou interrupção administrativa.
