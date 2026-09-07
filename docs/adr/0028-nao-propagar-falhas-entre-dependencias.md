---
status: accepted
---

# Não propagar falhas entre dependências

Cada serviço monitorado terá seu estado calculado somente a partir de seus próprios sinais e regras. Relações de dependência poderão ser registradas e exibidas como contexto, mas a falha de uma dependência não alterará automaticamente o estado de outro serviço; correlação e propagação dependeriam de inferências que ficam fora do MVP.
