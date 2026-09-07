---
status: accepted
---

# Fazer o simulador usar contratos públicos

O simulador se comportará como um serviço externo: exporá alvos para health checks e enviará sinais por uma chave de ingestão comum, sem acesso direto aos dados internos nem atalhos para criar alertas ou incidentes. Sua única capacidade especial será permitir a escolha das falhas geradas, incluindo lentidão, indisponibilidade, volume, duplicatas e atrasos. Assim, a demonstração exercitará os contratos e garantias reais de ponta a ponta.
