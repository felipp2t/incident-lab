---
status: accepted
---

# Rejeitar alterações baseadas em versões antigas

Alterações que substituem o estado de um incidente, como transição, severidade e responsabilidade, informarão a versão observada pelo autor. A primeira alteração válida avançará essa versão; tentativas concorrentes baseadas em uma versão anterior serão recusadas e receberão o estado atual para nova decisão, evitando sobrescrita silenciosa. Operações aditivas independentes, como mensagens, poderão ocorrer simultaneamente sem disputar a versão do incidente.
