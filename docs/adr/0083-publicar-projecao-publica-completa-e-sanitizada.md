---
status: accepted
---

# Publicar projeção pública completa e sanitizada

`PublicacaoAlterada` transportará a representação pública completa e já sanitizada do incidente público afetado, permitindo que a página substitua sua cópia local sem consultar dados internos. Comunicação será a única área responsável por selecionar e preparar o conteúdo externo; a página pública apenas armazenará e exibirá essa projeção. O contrato fica maior, mas reduz acoplamento, simplifica a recuperação após falhas e cria uma barreira explícita contra exposição acidental.
