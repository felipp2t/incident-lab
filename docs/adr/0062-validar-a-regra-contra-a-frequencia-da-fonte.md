---
status: accepted
---

# Validar a regra contra a frequência da fonte

Uma regra somente poderá ser ativada quando sua contagem ou janela temporal for compatível com a frequência esperada da fonte e permitir evidências suficientes para avaliação. Configurações impossíveis serão recusadas com explicação; se uma alteração posterior da fonte tornar uma regra incompatível, ela será suspensa e o `admin` será avisado, sem produzir alertas a partir de evidência insuficiente.
