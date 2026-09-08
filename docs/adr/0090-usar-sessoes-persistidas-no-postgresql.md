---
status: accepted
---

# Usar sessões persistidas no PostgreSQL

A autenticação inicial usará sessões opacas persistidas no PostgreSQL e cookies seguros, com identidades de demonstração provisionadas administrativamente. Isso permite revogação no servidor e evita manter tokens de autorização no navegador; cadastro público, convites, recuperação de senha e provedores externos permanecem fora da Fatia 1 até existir um fluxo que os exija.
