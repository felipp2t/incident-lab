---
status: accepted
---

# Limitar condições de regra por métrica no MVP

O MVP oferecerá condições próprias para cada métrica, em vez de operadores e fórmulas arbitrárias: disponibilidade compara saudável e indisponível; latência e taxa de erros ativam no limite ou acima e recuperam abaixo de um limite independente; heartbeat ativa por ausência e recupera com o retorno de evidência válida. Ativação e recuperação usarão confirmação por contagem consecutiva ou duração quando aplicável, e taxa de erros poderá exigir amostra mínima. Condições compostas e operadores genéricos poderão ser adicionados quando existirem casos concretos, preservando o versionamento e a explicabilidade das regras.
