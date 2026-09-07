---
status: accepted
---

# Garantir a criação do incidente após ativação

Quando um alerta se tornar ativo sem já existir um incidente automático ativo para a mesma combinação de serviço e regra, a criação desse incidente passará a ser uma obrigação durável do IncidentLab. Falhas internas poderão atrasar a criação, que será tentada novamente até concluir; todas as tentativas usarão a mesma identidade da ativação para impedir incidentes duplicados, e o incidente preservará o instante original em que o alerta foi confirmado. Se o alerta se recuperar antes da conclusão, o incidente ainda será criado com essa recuperação registrada, pois a condição chegou a ser confirmada e deve permanecer auditável. Uma nova ativação enquanto o incidente anterior permanecer ativo será anexada a ele conforme a regra de correlação, sem criar outra obrigação.
