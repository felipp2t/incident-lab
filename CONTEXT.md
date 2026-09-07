# IncidentLab

O IncidentLab detecta sintomas em serviços monitorados e coordena a resposta humana aos incidentes resultantes. Seu vocabulário separa fatos observados, condições operacionais e o trabalho de resposta.

## Organizações

**Vínculo organizacional**:
Associação entre um usuário e uma organização que define seu papel e, portanto, suas permissões naquele contexto.
_Evitar_: Responsável principal, participante

## Monitoramento

**Serviço monitorado**:
Sistema ou componente cuja saúde é acompanhada pelo IncidentLab.
_Evitar_: Aplicação, alvo

**Estado operacional do serviço**:
Visão atual agregada da saúde de um serviço, classificada como operacional, degradado, indisponível ou desconhecido.
_Evitar_: Severidade, estado do incidente

**Impacto operacional declarado**:
Contribuição de um incidente manual para o estado operacional do serviço, escolhida como nenhuma, degradado, indisponível ou desconhecido.
_Evitar_: Severidade, estado do incidente

**Fonte de sinais**:
Origem que observa um serviço monitorado e fornece sinais, seja por coleta do IncidentLab ou por envio externo.
_Evitar_: Serviço monitorado, integração

**Execução de health check**:
Tentativa agendada do IncidentLab de observar um alvo e classificá-la como saudável, falha observada do alvo ou lacuna de monitoramento.
_Evitar_: Regra de alerta, sinal externo

**Falha observada do alvo**:
Resultado de uma tentativa executada que não obteve do alvo a resposta esperada.
_Evitar_: Lacuna de monitoramento, causa raiz

**Lacuna de monitoramento**:
Ausência de uma observação confiável porque o IncidentLab não conseguiu executar a tentativa adequadamente.
_Evitar_: Falha observada do alvo, indisponibilidade confirmada

**Sinal**:
Fato observado sobre um serviço monitorado em um instante, capaz de carregar uma ou mais medições.
_Evitar_: Evento, alerta, incidente

**Instante observado**:
Momento em que a origem afirma ter realizado a observação contida no sinal.
_Evitar_: Instante recebido, instante processado

**Instante recebido**:
Momento em que o IncidentLab aceita o sinal e a partir do qual avalia atraso e desvio de relógio.
_Evitar_: Instante observado, instante processado

**Frescor da evidência**:
Período durante o qual uma observação ainda pode representar a condição atual da fonte.
_Evitar_: Retenção do sinal, atraso de processamento

**Sinal atrasado**:
Sinal cujo instante observado é anterior ao ponto já alcançado pela avaliação, preservado sem alterar o estado operacional atual.
_Evitar_: Sinal inválido, processamento atrasado

**Limite de ingestão**:
Quantidade máxima de sinais externos que uma fonte ou organização pode ter aceita em um período, aplicada antes da aceitação durável.
_Evitar_: Limite de cadastro, descarte de sinal aceito

**Medição**:
Valor tipado contido em um sinal, como disponibilidade, latência, taxa de erros ou heartbeat.
_Evitar_: Sinal, regra

**Regra de alerta**:
Condição configurada que avalia sinais ao longo do tempo para identificar um problema operacional.
_Evitar_: Monitor, gatilho

**Condição de ativação**:
Comparação e confirmação necessárias para uma regra transformar uma pendência em alerta ativo.
_Evitar_: Condição de recuperação, severidade

**Condição de recuperação**:
Comparação e confirmação independentes que demonstram o término técnico de um alerta ativo.
_Evitar_: Condição de ativação, resolução do incidente

**Versão da regra**:
Registro imutável da configuração de uma regra de alerta usado para explicar e reproduzir uma avaliação.
_Evitar_: Regra paralela, estado da avaliação

**Avaliação da regra**:
Máquina de estado corrente que aplica uma regra aos sinais recebidos e controla a ocorrência de alerta em andamento.
_Evitar_: Alerta, execução isolada

**Alerta**:
Ocorrência de uma regra de alerta iniciada quando sua condição começa a ser satisfeita, podendo tornar-se ativa, recuperada ou interrompida.
_Evitar_: Sinal, incidente

**Alerta pendente**:
Alerta cuja condição começou a ser satisfeita, mas ainda não atingiu o tempo ou a quantidade exigida para ativação.
_Evitar_: Alerta ativo, incidente aberto

**Alerta ativo**:
Alerta cuja condição de ativação foi confirmada e que ainda não satisfez sua condição de recuperação.
_Evitar_: Incidente aberto

**Alerta recuperado**:
Alerta anteriormente ativo cuja condição de recuperação foi confirmada.
_Evitar_: Incidente resolvido

**Alerta interrompido**:
Alerta ativo cuja avaliação terminou por uma decisão administrativa, sem evidência de recuperação do serviço.
_Evitar_: Alerta recuperado, incidente resolvido

## Resposta a incidentes

**Incidente**:
Processo operacional usado pela equipe para investigar, acompanhar e resolver um problema que afeta um serviço monitorado.
_Evitar_: Alerta, erro, falha

**Severidade**:
Classificação do impacto operacional conhecido de um incidente, independentemente de seu estado no ciclo de resposta.
_Evitar_: Prioridade, estado

**Resultado da resolução**:
Classificação da forma como um incidente foi encerrado: mitigado, recuperado, falso positivo ou duplicado.
_Evitar_: Estado, causa raiz

**Timeline**:
Registro cronológico e imutável dos fatos e das ações relevantes de um incidente.
_Evitar_: Log, histórico de mensagens

**Conversa do incidente**:
Discussão livre entre pessoas que colaboram durante a resposta e seu acompanhamento imediato, sem fazer parte automaticamente do histórico oficial do incidente.
_Evitar_: Timeline, postmortem

**Respondente**:
Membro da organização autorizado a participar da resposta a um incidente.
_Evitar_: Operador, agente

**Responsável principal**:
Respondente que coordena o incidente naquele momento; um incidente possui no máximo um, embora várias pessoas possam colaborar.
_Evitar_: Participante oficial, proprietário

**Presença na sala**:
Indicação efêmera de que um usuário está conectado à sala naquele momento, sem representar responsabilidade ou participação oficial.
_Evitar_: Participante, responsável principal

**Atualização da sala**:
Unidade persistida e ordenada de mudança que os clientes de uma sala de incidente podem receber ou recuperar após uma desconexão.
_Evitar_: Mensagem, entrada da timeline

**Postmortem**:
Documento posterior vinculado a um incidente para registrar contexto, causas, aprendizados e ações sem alterar o ciclo de vida do incidente.
_Evitar_: Timeline, resultado da resolução

## Comunicação

**Notificação interna**:
Aviso persistente destinado a um membro dentro do IncidentLab, independente de ele estar conectado naquele momento.
_Evitar_: Atualização em tempo real, mensagem do incidente

**Entrega de notificação**:
Envio de uma notificação a um destinatário por um canal específico, com resultado e ciclo de vida próprios.
_Evitar_: Solicitação de notificação, incidente

**Incidente público**:
Representação deliberadamente publicada e segura de um incidente, com conteúdo e ciclo de vida separados do registro interno.
_Evitar_: Incidente interno, página pública

**Resumo público pós-incidente**:
Cópia deliberadamente preparada a partir de um postmortem concluído para comunicar externamente o ocorrido sem expor seu conteúdo interno.
_Evitar_: Postmortem interno, atualização automática

## Confiabilidade

**Acontecimento isolado**:
Acontecimento interno que não pôde ser processado automaticamente e permanece preservado para intervenção, pausando somente a ordem de sua entidade.
_Evitar_: Acontecimento descartado, falha permanente de notificação

**Falha permanente de notificação**:
Resultado terminal de uma entrega que não pode ou não deve continuar sendo repetida, sem alterar o incidente que a originou.
_Evitar_: Acontecimento isolado, falha temporária
