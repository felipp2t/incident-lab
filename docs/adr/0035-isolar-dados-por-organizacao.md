---
status: accepted
---

# Isolar dados por organização

Todo serviço, regra, sinal, alerta e incidente pertencerá exatamente a uma organização, e relações entre organizações diferentes serão inválidas. Usuários acessarão dados somente por seu vínculo organizacional; chaves de ingestão ficarão vinculadas a um único serviço e não aceitarão que a origem escolha outra organização. Processos assíncronos e canais em tempo real também transportarão e validarão essa identidade, tornando o isolamento uma garantia transversal do domínio em vez de uma restrição apenas da interface.
