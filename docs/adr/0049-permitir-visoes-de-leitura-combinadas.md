---
status: accepted
---

# Permitir visões de leitura combinadas

Telas de consulta poderão usar visões que combinem informações de várias áreas, como serviço, estado operacional, incidente e responsável. Essas visões não controlarão os dados originais nem aceitarão alterações; comandos continuarão passando pela área proprietária, e telas de detalhe poderão consultar o estado oficial quando uma projeção estiver momentaneamente atrasada. A separação será limitada a modelos de escrita e leitura, sem adotar um CQRS complexo.
