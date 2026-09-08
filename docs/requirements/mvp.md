# Casos de uso e critérios de aceite do MVP

Status: aceito

Este documento transforma o [system design](../architecture/system-design.md) e o [modelo conceitual](../architecture/domain-model.md) em comportamento verificável, sem escolher tecnologias. O [vocabulário do domínio](../../CONTEXT.md) é canônico; os [ADRs](../adr/README.md) explicam por que as decisões foram tomadas.

## Objetivo do MVP

Uma pessoa deve conseguir provocar uma falha no simulador, observar sinais sendo aceitos e avaliados, acompanhar a abertura automática de um incidente, colaborar em sua resposta, confirmar a recuperação e resolver o incidente sem perda ou duplicação diante das falhas previstas.

```text
configurar → simular → detectar → alertar → responder → recuperar → resolver → explicar
```

## Atores

| Ator | Objetivo |
| --- | --- |
| `admin` | Administrar organização, serviços, fontes e regras e também responder a incidentes |
| `respondente` | Investigar, coordenar, comunicar e resolver incidentes |
| `visualizador` | Acompanhar operação e incidentes sem alterá-los |
| Fonte externa | Enviar sinais de um serviço por um contrato autenticado |
| Visitante | Consultar uma página pública sem acessar dados internos |
| Simulador | Produzir falhas usando os mesmos contratos de um serviço externo |

## Fatias de entrega

O detalhamento da ordem e das dependências está no [roteiro de implementação por fatias verticais](../implementation/roadmap.md).

### Fatia 1 — Caminho vertical demonstrável

Obrigatória para a primeira demonstração funcional:

1. Organização e papéis fixos.
2. Serviço monitorado e simulador.
3. Uma fonte de health check e uma fonte de ingestão.
4. Regras de disponibilidade, latência e taxa de erros.
5. Avaliação com ativação e recuperação.
6. Incidente automático e manual.
7. Sala com estado, responsabilidade, conversa e timeline.
8. Recuperação de desconexão.
9. Resolução com categoria e nota.

### Fatia 2 — MVP de portfólio

Completa a demonstração das qualidades arquiteturais:

1. Idempotência, concorrência e processamento atrasado.
2. Degradação sem tempo real e sem processadores assíncronos.
3. Notificações por severidade.
4. Página pública com conteúdo seguro.
5. Postmortem e métricas operacionais.
6. Retenção de sinais e evidências permanentes.
7. Cenários de carga e falha demonstráveis.

O MVP está completo somente quando as duas fatias satisfizerem seus critérios. A divisão permite entregar o caminho principal antes das provas de resiliência.

## Restrições transversais

- O sistema permanece dividido nas quatro áreas do system design, ainda dentro de uma única aplicação.
- Sinal, alerta e incidente continuam sendo conceitos e ciclos de vida distintos.
- O estado persistido, e não os canais de entrega, é a fonte da verdade.
- Cada área altera somente seus próprios dados e publica acontecimentos para reações posteriores.
- Visões combinadas são somente para leitura; alterações passam pelo modelo proprietário.
- Estado atual é armazenado diretamente e não é reconstruído por event sourcing.

Referências: [ADR 0001](../adr/0001-dividir-o-dominio-por-capacidades.md), [ADR 0002](../adr/0002-separar-sinais-alertas-e-incidentes.md), [ADR 0004](../adr/0004-manter-o-estado-persistido-como-fonte-da-verdade.md), [ADR 0048](../adr/0048-integrar-areas-por-acontecimentos.md), [ADR 0049](../adr/0049-permitir-visoes-de-leitura-combinadas.md), [ADR 0068](../adr/0068-nao-adotar-event-sourcing.md).

## UC-01 — Controlar acesso por organização

Como `admin`, quero atribuir papéis aos membros para limitar as ações dentro de cada organização.

Critérios de aceite:

- Dado um usuário sem organização, quando cria uma, então passa a ser seu primeiro membro com papel `admin`.
- Dado um membro `admin`, quando ele gerencia membros, serviços, fontes ou regras, então a ação é permitida.
- Dado um `respondente`, quando ele opera um incidente, então a ação é permitida; quando tenta administrar serviços ou regras, então é recusada.
- Dado um `visualizador`, quando tenta executar qualquer alteração, então a ação é recusada.
- Dado o mesmo usuário com papéis diferentes em duas organizações, quando alterna entre elas, então recebe as permissões do vínculo atual.
- Dado qualquer ator autenticado, quando tenta consultar ou relacionar dados de outra organização, então nenhuma informação é exposta e a operação é recusada.
- Dado um membro conectado, responsável por incidentes e com entregas externas pendentes, quando é removido, então seu acesso é revogado imediatamente e `MembroRemovido` permite que cada área encerre suas próprias pendências sem apagar autoria ou histórico.
- Dado um `MembroRemovido` repetido, quando uma área já concluiu sua reação, então não repete seus efeitos.
- Dado um responsável cujo papel muda para `visualizador`, quando `PapelDoMembroAlterado` é processado, então suas responsabilidades são liberadas, entregas externas incompatíveis são canceladas e sua conexão permanece disponível somente com as novas permissões.
- Dado um `visualizador` promovido, quando o novo papel é confirmado, então ele pode receber ações e comunicações futuras sem ser incluído retroativamente nas anteriores.

Referências: [ADR 0014](../adr/0014-usar-papeis-fixos-por-organizacao.md), [ADR 0035](../adr/0035-isolar-dados-por-organizacao.md), [ADR 0036](../adr/0036-revogar-acesso-sem-apagar-autoria.md), [ADR 0084](../adr/0084-propagar-alteracoes-de-papel-sem-remover-o-vinculo.md).

## UC-02 — Cadastrar e arquivar um serviço monitorado

Como `admin`, quero cadastrar um serviço e suas fontes para que o IncidentLab possa observá-lo.

Critérios de aceite:

- Dado um serviço novo, quando é cadastrado, então pertence a uma única organização e começa sem inventar estado saudável.
- Dado um serviço, quando uma fonte externa é configurada, então ela recebe identidade própria e frequência esperada quando aplicável.
- Dado um serviço, quando um health check é configurado, então intervalo, limite de tempo e resultado esperado precisam ser válidos.
- Dado um serviço com histórico e sem incidentes ativos, quando é arquivado, então coletas e avaliações param e o histórico permanece consultável.
- Dado um serviço com incidente ativo, quando alguém tenta arquivá-lo, então a operação é recusada.
- Dada uma ativação com criação automática de incidente ainda pendente, quando alguém tenta arquivar o serviço, então o arquivamento é recusado até que o incidente seja criado e resolvido.
- Dado um sinal aceito ainda não avaliado, quando o serviço é arquivado, então seu processamento registra o corte administrativo sem iniciar avaliação ou alerta.
- Dadas abertura manual e arquivamento concorrentes para o mesmo serviço, quando são decididos, então somente a primeira pode ser confirmada e a segunda observa seu resultado.
- Dada a consulta aos incidentes indisponível, quando alguém tenta arquivar o serviço, então o arquivamento é recusado para nova tentativa.
- Dado um serviço arquivado, quando é restaurado, então fontes e regras não retomam contagens antigas.

Referências: [ADR 0029](../adr/0029-arquivar-servicos-com-historico.md), [ADR 0032](../adr/0032-impedir-execucoes-sobrepostas-de-health-checks.md), [ADR 0085](../adr/0085-coordenar-abertura-manual-e-arquivamento-por-servico.md), [ADR 0086](../adr/0086-usar-arquivamento-como-corte-para-sinais-pendentes.md).

## UC-03 — Configurar uma regra de alerta

Como `admin`, quero configurar quando um sinal representa um problema e quando esse problema está recuperado.

Critérios de aceite:

- Dada uma regra, quando é criada, então seleciona exatamente um serviço, uma fonte, uma métrica, uma condição de ativação, uma condição de recuperação, um impacto operacional e uma severidade inicial.
- Dada uma regra de disponibilidade, quando é configurada, então ativa por valor indisponível e recupera por valor saudável.
- Dada uma regra de latência ou taxa de erros, quando é configurada, então ativa no limite ou acima e recupera abaixo de um limite independente.
- Dada uma regra de heartbeat, quando é configurada, então ativa por ausência durante o período definido e recupera quando volta a receber evidência válida.
- Dada uma condição compatível com confirmação, quando é configurada, então escolhe quantidade consecutiva ou duração, sem combinar as duas.
- Dada uma regra de taxa de erros, quando necessário, então pode exigir uma amostra mínima para considerar a medição válida.
- Dada uma tentativa de usar fórmula, operador lógico ou composição entre métricas, quando a regra é configurada, então ela é recusada como fora do MVP.
- Dada uma regra incompatível com a frequência da fonte, quando o `admin` tenta ativá-la, então recebe uma explicação e a regra permanece inativa.
- Dada uma regra pendente, quando limite, duração ou condição muda, então o progresso anterior é descartado e uma nova versão começa do zero.
- Dada uma regra com alerta ativo, quando é editada, então o alerta continua usando a versão original e a nova versão aguarda a próxima avaliação.
- Dada uma regra pendente, quando é desativada, então a pendência é cancelada.
- Dada uma regra com alerta ativo, quando é desativada, então o alerta fica interrompido, o incidente continua aberto e a timeline registra a decisão.

Referências: [ADR 0006](../adr/0006-inicializar-a-severidade-a-partir-da-regra.md), [ADR 0007](../adr/0007-versionar-regras-durante-a-avaliacao.md), [ADR 0011](../adr/0011-separar-confirmacao-e-recuperacao-do-alerta.md), [ADR 0030](../adr/0030-permitir-desativar-regras-com-alertas-ativos.md), [ADR 0061](../adr/0061-avaliar-uma-fonte-por-regra.md), [ADR 0062](../adr/0062-validar-a-regra-contra-a-frequencia-da-fonte.md), [ADR 0070](../adr/0070-limitar-condicoes-de-regra-por-metrica-no-mvp.md).

## UC-04 — Aceitar sinais externos

Como fonte externa, quero enviar sinais com confirmação confiável para que tentativas de entrega não alterem o significado dos dados.

Critérios de aceite:

- Dado um sinal válido, quando é recebido, então somente é confirmado depois de aceito com segurança.
- Dado um sinal com várias medições e uma inválida, quando é recebido, então o sinal inteiro é recusado e todos os erros são informados.
- Dado um sinal recusado por validação, quando é corrigido e reenviado com o mesmo identificador, então pode ser aceito.
- Dado um sinal já aceito, quando a mesma fonte repete identidade e conteúdo, então recebe o resultado original e nenhuma avaliação adicional ocorre.
- Dado um sinal já aceito, quando a mesma fonte repete a identidade com conteúdo diferente, então recebe conflito.
- Dado um sinal que não pode ser aceito com segurança, quando chega, então é recusado explicitamente para nova tentativa.
- Dada uma fonte que já teve 120 sinais aceitos na janela de um minuto, quando envia outro sinal, então ele é recusado temporariamente antes da aceitação durável e pode ser repetido com a mesma identidade.
- Dada uma organização que já teve 1.000 sinais aceitos na janela de um minuto, quando qualquer fonte envia outro sinal, então ele é recusado temporariamente sem afetar sinais já aceitos.
- Dada uma fonte dentro de seu limite cuja organização ainda possui capacidade, quando envia um sinal válido, então outra fonte que excedeu seu próprio limite não impede a aceitação.
- Dada uma credencial de ingestão, quando um sinal é enviado, então fonte, serviço e organização são determinados pelo vínculo da credencial e não por identificadores escolhidos no conteúdo.
- Dadas duas fontes do mesmo serviço usando o mesmo identificador de origem, quando enviam seus sinais, então não colidem porque a identidade é escopada pela fonte.
- Dado um sinal anterior ao ponto já avaliado, quando chega, então é preservado como atrasado e não altera o estado atual.
- Dada uma fonte com frequência esperada, quando nenhuma validade específica é configurada, então seu frescor equivale a três vezes essa frequência.
- Dado um sinal com instante observado até um minuto no futuro, quando é aceito, então o instante original é preservado e a avaliação não usa um instante posterior ao recebimento.
- Dado um sinal com instante observado mais de um minuto no futuro, quando chega, então o sinal inteiro é rejeitado.
- Dado um sinal que era temporalmente válido na aceitação e cujo serviço permanece ativo, quando o processamento interno atrasa, então ele continua elegível e é processado na ordem durável.
- Dado um sinal aceito antes do arquivamento mas ainda não avaliado no corte, quando seu processamento ocorre, então registra o motivo administrativo e não altera o estado atual.
- Dada uma fonte sem frequência esperada, quando alguém configura uma regra baseada em silêncio ou duração, então a configuração é recusada até que o contrato temporal seja definido.

Referências: [ADR 0008](../adr/0008-tornar-a-ingestao-de-sinais-idempotente.md), [ADR 0009](../adr/0009-nao-reavaliar-o-estado-com-sinais-atrasados.md), [ADR 0034](../adr/0034-confirmar-sinais-somente-apos-aceitacao-duravel.md), [ADR 0063](../adr/0063-aceitar-ou-rejeitar-o-sinal-inteiro.md), [ADR 0071](../adr/0071-definir-semantica-temporal-dos-sinais.md), [ADR 0077](../adr/0077-limitar-apenas-fluxos-operacionais-no-mvp.md), [ADR 0086](../adr/0086-usar-arquivamento-como-corte-para-sinais-pendentes.md).

## UC-05 — Executar health checks

Como `admin`, quero que o IncidentLab verifique um alvo periodicamente para detectar indisponibilidade e latência.

Critérios de aceite:

- Dado um health check devido e sem execução ativa, quando chega seu horário, então uma tentativa é iniciada.
- Dado um intervalo menor que 30 segundos, quando um `admin` tenta configurar o health check, então a configuração é recusada com o limite permitido.
- Dado um health check ainda ativo, quando chega o horário seguinte, então outra tentativa não começa e o atraso é contabilizado.
- Dado um horário agendado, quando sua tentativa termina com qualquer resultado, então nenhuma repetição imediata é iniciada no MVP.
- Dado um alvo que responde conforme esperado dentro do limite, quando a tentativa termina, então produz disponibilidade saudável e a latência observada.
- Dado um alvo que responde lentamente dentro do limite, quando a tentativa termina, então permanece saudável para disponibilidade e sua latência pode ser avaliada por regra própria.
- Dada uma tentativa executada cujo alvo não responde conforme esperado, quando termina, então produz uma falha observada do serviço.
- Dada uma falha de resolução de nome, conexão, canal seguro, tempo de resposta, status ou conteúdo durante a tentativa específica, quando ela é classificada, então registra uma falha observada do alvo com o motivo correspondente.
- Dada uma incapacidade interna de executar a tentativa, quando ocorre, então produz falha do monitoramento e não do serviço.
- Dado executor indisponível, erro interno, sobreposição ou encerramento, quando uma observação confiável não ocorre, então registra uma lacuna de monitoramento e reduz a cobertura.
- Dada uma falha diagnosticada na infraestrutura comum do IncidentLab, quando vários alvos são afetados, então ela não é atribuída automaticamente a cada serviço monitorado.
- Dado um período em que o executor ficou parado, quando retorna, então faz uma verificação atual e não reproduz as antigas.
- Dada uma lacuna sem evidência confiável, quando ultrapassa a validade definida no cenário, então o estado aplicável fica desconhecido.

Referências: [ADR 0031](../adr/0031-distinguir-falha-do-servico-e-falha-do-monitoramento.md), [ADR 0032](../adr/0032-impedir-execucoes-sobrepostas-de-health-checks.md), [ADR 0033](../adr/0033-nao-reproduzir-health-checks-perdidos.md), [ADR 0076](../adr/0076-classificar-resultados-de-health-check.md), [ADR 0077](../adr/0077-limitar-apenas-fluxos-operacionais-no-mvp.md).

## UC-06 — Avaliar ativação e recuperação

Como `respondente`, quero que condições sejam confirmadas ao longo do tempo para evitar incidentes causados por oscilações isoladas.

Critérios de aceite:

- Dada uma regra de três falhas consecutivas, quando ocorrem duas falhas, um sucesso e três falhas, então somente a última sequência ativa o alerta.
- Dada uma regra de um minuto, quando a condição deixa de valer antes do minuto, então a pendência volta ao normal.
- Dada uma regra temporal, quando existe apenas uma medição ruim e depois silêncio, então o alerta não é ativado por prolongamento artificial.
- Dado um alerta ativo que exige dois sucessos para recuperar, quando ocorre sucesso, falha, sucesso e sucesso, então apenas os dois últimos confirmam a recuperação.
- Dado um alerta ativo e ausência posterior de sinais, quando a evidência perde frescor, então o alerta não é recuperado por silêncio.
- Dados sinais concorrentes para a mesma combinação de serviço e regra, quando são avaliados, então contagens e transições respeitam uma única ordem.
- Dadas regras ou serviços diferentes, quando recebem sinais simultaneamente, então podem ser avaliados de forma independente.

Referências: [ADR 0010](../adr/0010-tratar-ausencia-de-sinais-como-condicao-explicita.md), [ADR 0011](../adr/0011-separar-confirmacao-e-recuperacao-do-alerta.md), [ADR 0039](../adr/0039-serializar-avaliacao-por-servico-e-regra.md), [ADR 0045](../adr/0045-exigir-evidencias-ao-longo-da-janela.md).

## UC-07 — Abrir e correlacionar um incidente automático

Como `respondente`, quero receber um único incidente para uma ocorrência confirmada sem perder ativações durante falhas internas.

Critérios de aceite:

- Dado um alerta que acaba de ficar ativo sem incidente automático correspondente, quando o acontecimento é processado, então um incidente aberto é criado com serviço, regra, versão, severidade e evidências.
- Dado que a criação falha temporariamente, quando o processamento retorna, então o incidente é criado uma vez com o instante original da ativação.
- Dado que o alerta recupera antes da criação atrasada, quando a obrigação é processada, então o incidente ainda é criado com ativação e recuperação registradas.
- Dado um incidente automático ainda ativo, quando a mesma regra recupera e ativa novamente, então a reincidência entra na timeline existente sem abrir outro incidente.
- Dado um incidente anterior resolvido, quando ocorre nova ativação, então um novo incidente é criado.
- Dado um incidente manual ativo do mesmo serviço, quando uma regra ativa, então um incidente automático separado é criado.

Referências: [ADR 0003](../adr/0003-correlacionar-incidente-por-servico-e-regra.md), [ADR 0012](../adr/0012-garantir-a-criacao-do-incidente-apos-ativacao.md).

## UC-08 — Abrir um incidente manual

Como `respondente`, quero abrir um incidente quando percebo um problema que o monitoramento não detectou.

Critérios de aceite:

- Dado um `respondente` ou `admin`, quando abre um incidente manual, então seleciona exatamente um serviço, severidade e impacto operacional declarado.
- Dado um serviço inexistente, de outra organização ou arquivado, quando a abertura é solicitada, então nenhum incidente é criado.
- Dado que o cadastro oficial do serviço não pode ser consultado, quando a abertura é solicitada, então o comando é recusado para nova tentativa.
- Dado um incidente manual, quando é criado, então começa `aberto`, privado e pode ficar sem responsável.
- Dado seu impacto `degradado`, `indisponível` ou `desconhecido`, quando o incidente fica ativo, então contribui para o estado agregado do serviço.
- Dado um impacto manual declarado ou alterado, quando a mudança é confirmada, então a timeline e o acontecimento específico são registrados juntos para Monitoramento recalcular o serviço.
- Dado o incidente resolvido, quando seu impacto deixa de valer, então um acontecimento específico de encerramento é registrado para Monitoramento recalcular o serviço.
- Dada uma repetição do mesmo acontecimento de impacto, quando Monitoramento o processa, então a contribuição é aplicada uma única vez.

Referências: [ADR 0037](../adr/0037-limitar-cada-incidente-a-um-servico.md), [ADR 0064](../adr/0064-permitir-impacto-operacional-em-incidentes-manuais.md), [ADR 0080](../adr/0080-integrar-impactos-manuais-por-acontecimentos-especificos.md), [ADR 0085](../adr/0085-coordenar-abertura-manual-e-arquivamento-por-servico.md).

## UC-09 — Coordenar e resolver um incidente

Como `respondente`, quero coordenar o trabalho com estados e responsabilidade claros.

Critérios de aceite:

- Dado um incidente em qualquer estado não terminal, quando ocorre uma transição permitida, então estado, versão, timeline e obrigação de divulgação são confirmados juntos.
- Dada uma transição não prevista na máquina de estados, quando é solicitada, então é recusada sem alteração parcial.
- Dado um incidente sem responsável, quando dois membros tentam assumi-lo ao mesmo tempo, então somente o primeiro vence e o outro recebe o estado atual.
- Dado um incidente atribuído, quando outro `respondente` tenta tomá-lo, então é recusado; o responsável atual pode transferi-lo e um `admin` pode substituí-lo ou removê-lo.
- Dadas duas alterações baseadas na mesma versão, quando a primeira é confirmada, então a segunda recebe conflito e não sobrescreve o estado.
- Dada uma mudança de severidade, quando é confirmada, então reincidências e edições da regra não a sobrescrevem.
- Dada uma mudança de estado, severidade ou responsabilidade, quando é confirmada, então produz seu acontecimento específico e não um `IncidenteAlterado` genérico.
- Dado um incidente não resolvido, quando é resolvido, então categoria e nota são obrigatórias e `resolvido` torna-se terminal.
- Dado um incidente resolvido, quando `IncidenteResolvido` é publicado, então contém a categoria e os dados operacionais mínimos, mas não a nota interna de resolução.
- Dado um alerta ainda ativo, quando o incidente é resolvido com confirmação explícita, então o alerta e o impacto do monitoramento continuam ativos e uma recuperação tardia entra na timeline sem reabrir o incidente.
- Dados dois incidentes do mesmo problema, quando um é marcado como `duplicado`, então referencia o principal, é resolvido e nenhum histórico é mesclado.

Referências: [ADR 0005](../adr/0005-tornar-a-resolucao-do-incidente-terminal.md), [ADR 0013](../adr/0013-atribuir-um-responsavel-principal-ao-incidente.md), [ADR 0015](../adr/0015-controlar-a-atribuicao-do-responsavel-principal.md), [ADR 0016](../adr/0016-rejeitar-alteracoes-baseadas-em-versoes-antigas.md), [ADR 0038](../adr/0038-confirmar-estado-timeline-e-divulgacao-juntos.md), [ADR 0043](../adr/0043-relacionar-incidentes-duplicados-sem-mescla.md), [ADR 0044](../adr/0044-classificar-a-resolucao-do-incidente.md), [ADR 0046](../adr/0046-permitir-resolver-com-alerta-ainda-ativo.md), [ADR 0081](../adr/0081-publicar-mudancas-de-incidente-como-fatos-especificos.md), [ADR 0082](../adr/0082-nao-transportar-a-nota-interna-na-resolucao.md).

## UC-10 — Colaborar e recuperar uma sala

Como `respondente`, quero conversar e acompanhar mudanças sem perder informações durante uma desconexão.

Critérios de aceite:

- Dado um comando do cliente, quando a confirmação se perde e o mesmo identificador é reenviado, então o resultado original é devolvido sem repetir o efeito.
- Dadas mensagens simultâneas, quando são confirmadas, então ambas permanecem e recebem posições distintas na sequência da sala.
- Dada uma operação confirmada, quando sua atualização é produzida, então transporta apenas suas mudanças inseparáveis e a nova sequência, não o estado completo da sala.
- Dada uma mensagem confirmada, quando o autor tenta editar ou apagar, então a operação é recusada; uma correção é enviada como nova mensagem.
- Dada uma mensagem relevante, quando um respondente a promove, então uma cópia independente entra na timeline.
- Dada uma promoção confirmada, quando a mensagem original é posteriormente ocultada ou expira pela retenção, então a cópia oficial permanece na timeline.
- Dado o mesmo comando de envio ou promoção repetido, quando seu efeito já foi confirmado, então o resultado anterior é devolvido sem criar outra mensagem ou nota.
- Dados comandos distintos ou concorrentes para promover a mesma mensagem, quando são processados, então somente uma entrada é criada e os demais recebem a promoção existente.
- Dado conteúdo sensível em mensagem ou timeline, quando um `admin` solicita sua ocultação, então um motivo é obrigatório, o conteúdo deixa de ser exibido e autoria, instante e intervenção permanecem auditáveis.
- Dada uma mensagem promovida, quando somente a mensagem ou somente sua nota é ocultada, então a outra cópia permanece inalterada.
- Dado um conteúdo já ocultado, quando outro comando tenta ocultá-lo novamente, então recebe a moderação existente sem criar outra intervenção.
- Dado um conteúdo ocultado cujo original continua disponível, quando um `admin` restaura sua exibição com motivo, então o conteúdo volta a ser apresentado e a ocultação e a restauração permanecem auditáveis.
- Dada uma mensagem promovida, quando somente a mensagem ou somente sua nota é restaurada, então a outra cópia permanece inalterada.
- Dado um conteúdo já visível, quando outro comando tenta restaurá-lo novamente, então recebe a restauração vigente sem criar outra intervenção.
- Dado um conteúdo indisponível por retenção ou exclusão administrativa, quando sua restauração é solicitada, então a operação é recusada sem alteração parcial.
- Dado um conteúdo restaurado e novamente ocultado, quando as intervenções são consultadas, então todo o ciclo permanece ordenado e auditável.
- Dado um conteúdo ocultado, quando qualquer pessoa consulta normalmente a sala, busca, notificações, projeções públicas ou exportações operacionais, então recebe no máximo a indicação da ocultação, ainda que seja `admin`.
- Dado um conteúdo ocultado ainda disponível, quando um `admin` com permissão vigente o consulta pela visão de moderação, então o acesso é registrado antes de o original ser revelado.
- Dada uma nova consulta administrativa ao mesmo conteúdo ocultado, quando é confirmada, então produz outro registro de acesso; repetir a mesma solicitação não duplica o registro.
- Dada uma falha ao confirmar o registro de acesso, quando a consulta administrativa é realizada, então o conteúdo não é revelado.
- Dado o histórico completo de moderação, quando um `admin` com permissão vigente o consulta, então recebe em ordem as intervenções, motivos e acessos administrativos, sem receber o conteúdo original ocultado implicitamente.
- Dado um `respondente` ou `visualizador`, quando consulta uma mensagem ou entrada moderada, então recebe somente seu estado atual de apresentação e não o motivo ou histórico de moderação.
- Dado um usuário que apenas abre ou observa a sala, quando sai, então nenhum vínculo persistente de participação é criado.
- Dado um usuário com a sala conectada, quando sua conexão termina, então sua presença desaparece após a tolerância do cenário sem entrada na timeline.
- Dado um incidente resolvido há menos de sete dias, quando um `respondente` ou `admin` envia ou promove uma mensagem, então a operação é aceita sem alterar o estado terminal.
- Dado um incidente resolvido há sete dias ou mais, quando alguém tenta enviar ou promover uma mensagem, então a operação é recusada e a conversa permanece somente para leitura.
- Dada a conversa encerrada, quando chega uma recuperação técnica tardia, então sua entrada automática ainda pode ser registrada na timeline.
- Dada a conversa encerrada, quando o postmortem é editado, então seu próprio ciclo continua sem reabrir a conversa ou o incidente.
- Dado que o cliente recebeu até a sequência 40, quando reconecta e existem 41 a 45, então recebe o intervalo em ordem e ignora repetições.
- Dado que o intervalo não pode ser recuperado, quando reconecta, então recebe o estado completo atual.
- Dado um estado completo recebido após uma lacuna, quando o cliente o aplica, então substitui sua visão e continua a partir da sequência corrente informada.
- Dado um membro sem vínculo ou permissão vigente, quando tenta conectar ou recuperar uma sala, então nenhum conteúdo protegido é entregue.
- Dado que o canal em tempo real está indisponível, quando a equipe opera o incidente, então comandos persistidos continuam e a interface informa a degradação e permite atualização periódica.

Referências: [ADR 0017](../adr/0017-manter-a-timeline-imutavel.md), [ADR 0018](../adr/0018-separar-conversa-e-timeline.md), [ADR 0019](../adr/0019-manter-mensagens-imutaveis.md), [ADR 0020](../adr/0020-tratar-presenca-como-informacao-efemera.md), [ADR 0021](../adr/0021-recuperar-atualizacoes-por-sequencia.md), [ADR 0022](../adr/0022-tornar-comandos-do-cliente-idempotentes.md), [ADR 0052](../adr/0052-permitir-operacao-sem-tempo-real.md), [ADR 0069](../adr/0069-nao-manter-lista-persistente-de-participantes-no-mvp.md), [ADR 0075](../adr/0075-permitir-conversa-por-sete-dias-apos-a-resolucao.md), [ADR 0087](../adr/0087-restringir-o-acesso-a-conteudo-ocultado.md).

## UC-11 — Notificar a equipe

Como `respondente`, quero ser avisado de incidentes relevantes sem tornar a entrega uma dependência da resposta.

Critérios de aceite:

- Dado um incidente `low` ou `medium`, quando abre, então `respondentes` e `admins` recebem notificação interna.
- Dado um incidente `high` ou `critical`, quando abre, então também são criadas entregas de e-mail para os membros elegíveis.
- Dado um acontecimento de incidente sem destinatários embutidos, quando Comunicação cria notificações, então consulta Organizações e aplica sua política aos vínculos ativos naquele momento.
- Dada uma falha ao consultar Organizações, quando a audiência não pode ser determinada, então a solicitação permanece pendente para repetição e o incidente continua confirmado.
- Dado o mesmo acontecimento processado novamente, quando a solicitação já existe, então não cria outra solicitação, notificação interna ou entrega.
- Dado um acontecimento e um destinatário elegível, quando a audiência é materializada, então existe no máximo uma notificação interna para essa combinação.
- Dada uma notificação com mais de um canal aplicável, quando as entregas são criadas, então cada canal possui identidade e resultado independentes.
- Dado um incidente cuja severidade é elevada para uma faixa que amplia a audiência ou alcança `critical`, quando a mudança é confirmada, então somente as novas entregas necessárias são criadas.
- Dada uma atribuição ou transferência de responsabilidade, quando é confirmada, então somente a pessoa diretamente envolvida recebe a notificação correspondente.
- Dado um incidente resolvido, quando o encerramento é confirmado, então os destinatários das comunicações anteriores de abertura ou escalada recebem o encerramento pelo canal aplicável.
- Dada uma mensagem ou transição rotineira entre investigação e monitoramento, quando ocorre, então nenhuma notificação geral é criada.
- Dada uma notificação interna, quando o destinatário estava desconectado, então ela permanece disponível para consulta posterior.
- Dado o canal em tempo real indisponível, quando uma notificação é criada, então seu registro interno continua disponível independentemente desse canal.
- Dada uma falha temporária de canal, quando ocorre, então o incidente permanece confirmado e a entrega é tentada novamente.
- Dada uma falha temporária de e-mail, quando persiste, então a tentativa inicial é seguida por repetições previstas para 1, 5, 15, 60 e 360 minutos após a primeira falha, sempre com a mesma identidade.
- Dada uma falha permanente, quando o limite do cenário é atingido, então a falha fica visível sem poluir a timeline com cada tentativa.
- Dado um endereço ou uma recusa reconhecidamente permanente, quando a entrega é processada, então fica como falha permanente sem repetições inúteis.
- Dada uma resposta ambígua do provedor, quando a entrega é repetida, então uma possível duplicata externa não duplica a entrega lógica dentro do IncidentLab.
- Dado um membro removido ou inelegível antes do envio do e-mail, quando a entrega é processada, então ela é cancelada sem expor o incidente.
- Dada uma preferência pessoal que silencia e-mail, quando um incidente `high` notifica, então o e-mail é omitido; uma comunicação `critical` obrigatória pela organização não pode ser silenciada.
- Dado um e-mail de incidente, quando é produzido, então contém apenas serviço, severidade, estado, resumo seguro e referência para acesso autenticado.
- Dada uma notificação entregue, quando o membro a recebe ou abre, então não se torna responsável automaticamente.

Referências: [ADR 0023](../adr/0023-desacoplar-notificacoes-do-incidente.md), [ADR 0047](../adr/0047-notificar-membros-conforme-a-severidade.md), [ADR 0072](../adr/0072-usar-notificacoes-internas-e-email-no-mvp.md), [ADR 0078](../adr/0078-padronizar-repeticoes-assincronas-no-mvp.md), [ADR 0079](../adr/0079-consultar-organizacoes-para-resolver-audiencia.md).

## UC-12 — Publicar status seguro

Como `admin`, quero comunicar incidentes publicamente sem expor detalhes internos.

Critérios de aceite:

- Dado um serviço público e uma regra marcada para publicação, quando seu incidente abre, então uma publicação cautelosa aparece automaticamente.
- Dada uma transição para `investigando`, `monitorando` ou `resolvido`, quando ocorre, então a publicação recebe texto genérico seguro correspondente.
- Dado qualquer conteúdo interno de conversa, timeline, responsabilidade ou suspeita, quando a publicação é gerada, então esse conteúdo não é copiado.
- Dado um incidente manual, quando abre, então permanece privado até uma publicação explícita.
- Dado um incidente resolvido enquanto o alerta permanece ativo, quando a comunicação é atualizada, então nenhuma recuperação é afirmada automaticamente e um respondente escolhe manter ou encerrar a publicação.
- Dada uma regra interna não publicável, quando afeta o estado interno, então não altera o estado público.
- Dado `EstadoOperacionalAlterado`, quando o estado público é calculado, então esse acontecimento interno não participa do cálculo.
- Dada uma publicação criada ou atualizada, quando `PublicacaoAlterada` é produzido, então contém a representação pública completa e sanitizada do incidente afetado.
- Dado um `PublicacaoAlterada` mais recente, quando a página o processa, então substitui sua cópia sem consultar qualquer fonte interna.
- Dado um acontecimento repetido ou mais antigo, quando a página o processa, então não duplica atualizações nem regride a versão publicada.
- Dada a fonte principal indisponível, quando a página continua acessível com dados anteriores, então mostra o instante da última atualização.

Referências: [ADR 0024](../adr/0024-publicar-incidentes-automaticamente-com-conteudo-seguro.md), [ADR 0065](../adr/0065-separar-estado-interno-e-estado-publico.md), [ADR 0066](../adr/0066-separar-historicos-interno-e-publico.md), [ADR 0083](../adr/0083-publicar-projecao-publica-completa-e-sanitizada.md).

## UC-13 — Produzir postmortem

Como `respondente`, quero explicar um incidente depois da resolução para registrar aprendizado e ações preventivas.

Critérios de aceite:

- Dado um incidente `high` ou `critical` resolvido, quando a resolução é confirmada, então uma pendência de postmortem é criada sem bloquear o encerramento.
- Dado um incidente `low` ou `medium`, quando um `respondente` ou `admin` decide documentá-lo, então um postmortem opcional começa como rascunho.
- Dado um postmortem pendente, quando alguém começa a preenchê-lo, então ele passa a rascunho.
- Dado um postmortem iniciado, quando é preparado, então usa a timeline como referência e permite registrar resumo, impacto, causa conhecida ou não determinada, solução ou mitigação, aprendizados e ações preventivas.
- Dado um postmortem com o conteúdo necessário, quando um `respondente` ou `admin` o conclui, então ele fica concluído sem alterar o estado do incidente.
- Dado um postmortem concluído, quando é alterado, então volta a rascunho e a mudança fica auditada.
- Dado um postmortem interno concluído, quando nenhuma publicação é solicitada, então nenhum conteúdo se torna público automaticamente.
- Dado um postmortem concluído de incidente já público, quando um `respondente` ou `admin` solicita a publicação, então revisa uma prévia segura e a confirma em uma única ação.
- Dado um resumo público publicado, quando o postmortem interno muda, então a versão pública permanece inalterada até outra publicação explícita.
- Dado um postmortem de incidente privado, quando alguém tenta publicar somente seu resumo, então a operação é recusada no MVP.
- Dada uma ação preventiva, quando é registrada no MVP, então permanece textual sem atribuição, prazo ou fluxo de tarefa.

Referências: [ADR 0025](../adr/0025-exigir-postmortem-sem-bloquear-a-resolucao.md), [ADR 0073](../adr/0073-separar-postmortem-interno-e-resumo-publico.md).

## UC-14 — Calcular estado e indicadores

Como `respondente`, quero distinguir saúde, cobertura e desempenho da resposta.

Critérios de aceite:

- Dados vários impactos ativos, quando o estado do serviço é calculado, então aplica a precedência `indisponível > degradado > desconhecido > operacional`.
- Dada uma mudança de contribuição que não altera o resultado agregado, quando o serviço é recalculado, então não produz `EstadoOperacionalAlterado`.
- Dada uma mudança que altera o resultado agregado, quando o serviço é recalculado, então estado, histórico e obrigação de publicar `EstadoOperacionalAlterado` são confirmados juntos.
- Dado um alerta apenas pendente, quando o estado é calculado, então ele não altera o resultado.
- Dada uma dependência relacionada que fica indisponível, quando o estado do serviço dependente é calculado, então ele não muda sem evidência própria.
- Dado um período desconhecido, quando a disponibilidade é calculada, então esse período não é classificado como disponível nem indisponível.
- Dado um intervalo consultado, quando os indicadores são exibidos, então disponibilidade e cobertura aparecem separadamente.
- Dado um incidente automático, quando suas durações são calculadas, então detecção, recuperação técnica e resolução operacional usam os marcos definidos no system design.
- Dados estados interno e público divergentes, quando os históricos são calculados, então cada um usa somente sua própria fonte.

Referências: [ADR 0026](../adr/0026-separar-tempos-de-deteccao-recuperacao-e-resolucao.md), [ADR 0027](../adr/0027-derivar-o-estado-do-servico-dos-alertas.md), [ADR 0028](../adr/0028-nao-propagar-falhas-entre-dependencias.md), [ADR 0065](../adr/0065-separar-estado-interno-e-estado-publico.md), [ADR 0066](../adr/0066-separar-historicos-interno-e-publico.md), [ADR 0067](../adr/0067-separar-disponibilidade-e-cobertura.md), [ADR 0080](../adr/0080-integrar-impactos-manuais-por-acontecimentos-especificos.md).

## UC-15 — Reter histórico e evidências

Como `respondente`, quero compreender por que um alerta ocorreu mesmo depois da remoção dos sinais brutos.

Critérios de aceite:

- Dado um sinal bruto com mais de 30 dias, quando a retenção é executada, então ele pode ser removido sem apagar alertas, incidentes, timeline, postmortem ou indicadores consolidados.
- Dado um alerta confirmado, quando suas evidências permanentes são consultadas, então incluem primeiro sinal, janela ou sequência de ativação, recuperação e versão da regra.
- Dado um alerta ativo com muitos sinais repetitivos, quando a timeline é consultada, então contém ativação, mudanças relevantes e recuperação, não cada medição.
- Dada uma correção de timeline, quando ocorre, então uma nova entrada referencia a anterior sem modificá-la.
- Dado um incidente resolvido há mais de 180 dias, quando a retenção da conversa é executada, então o conteúdo das mensagens pode ser removido sem apagar notas promovidas para a timeline.
- Dada uma notificação interna com mais de 90 dias, quando a retenção é executada, então ela pode ser removida sem alterar o incidente.
- Dada uma entrega encerrada há mais de 30 dias, quando a retenção técnica é executada, então seus detalhes de tentativa podem ser removidos sem apagar o resultado operacional necessário.
- Dado um acontecimento processado há mais de 7 dias, quando a retenção é executada, então ele pode ser removido sem reconstruir o estado a partir dele.
- Dado um acontecimento isolado ainda não resolvido, quando qualquer prazo decorre, então ele permanece disponível; após sua resolução, o prazo de 7 dias começa.
- Dada uma ação administrativa auditada há menos de 2 anos, quando a retenção é executada, então seu registro permanece.
- Dados incidente, timeline, resultado, alerta, evidência preservada, versão de regra usada, postmortem ou conteúdo público, quando a retenção automática executa, então esses registros não são removidos no MVP.
- Dado um identificador de sinal ou comando aceito há mais de 30 dias, quando é repetido, então não existe garantia de recuperar o resultado original.
- Dada uma obrigação legal de exclusão, quando é autorizada pelo processo excepcional, então a remoção é auditada independentemente dos prazos comuns.

Referências: [ADR 0017](../adr/0017-manter-a-timeline-imutavel.md), [ADR 0040](../adr/0040-aplicar-retencao-finita-aos-sinais-brutos.md), [ADR 0041](../adr/0041-preservar-evidencias-minimas-do-alerta.md), [ADR 0042](../adr/0042-nao-registrar-cada-sinal-na-timeline.md), [ADR 0074](../adr/0074-definir-retencao-por-finalidade-no-mvp.md).

## UC-16 — Degradar e recuperar sem perder trabalho

Como operador do IncidentLab, quero que falhas parciais tenham comportamento previsível e observável.

Critérios de aceite:

- Dado o processamento assíncrono parado e a aceitação durável disponível, quando chegam sinais e comandos, então eles são confirmados, ficam pendentes e são retomados depois em ordem.
- Dada a fonte da verdade indisponível, quando chegam escritas, então são recusadas; leituras antigas, quando disponíveis, aparecem como desatualizadas.
- Dado um acontecimento entregue novamente, quando o consumidor já o processou, então nenhum efeito adicional ocorre.
- Dada uma falha temporária de processamento, quando persiste, então a tentativa inicial é seguida por repetições previstas para 1, 5, 15, 60 e 360 minutos após a primeira falha.
- Dado um acontecimento que excedeu o limite de tentativas, quando é isolado, então somente sua entidade e acontecimentos posteriores ficam pausados; outras entidades continuam.
- Dada a causa corrigida, quando o item isolado é reenviado com a mesma identidade, então o processamento continua sem duplicar efeitos.
- Dado um fluxo `sinal → alerta → incidente → notificação`, quando é observado, então cada etapa possui identidade e causa próprias e compartilha a correlação do fluxo.
- Dada uma falha parcial interna, quando o automonitoramento a detecta, então ela não é atribuída a organizações clientes.

Referências: [ADR 0050](../adr/0050-assumir-entrega-repetida-de-acontecimentos.md), [ADR 0051](../adr/0051-isolar-falhas-sem-quebrar-a-ordem-da-entidade.md), [ADR 0053](../adr/0053-degradar-com-processamento-assincrono-indisponivel.md), [ADR 0054](../adr/0054-nao-confirmar-escritas-sem-a-fonte-da-verdade.md), [ADR 0055](../adr/0055-propagar-causalidade-e-correlacao.md), [ADR 0056](../adr/0056-combinar-automonitoramento-e-observacao-externa.md), [ADR 0078](../adr/0078-padronizar-repeticoes-assincronas-no-mvp.md).

## UC-17 — Demonstrar o fluxo de ponta a ponta

Como visitante do portfólio, quero provocar e acompanhar um incidente completo para verificar o comportamento do sistema.

Critérios de aceite:

- Dado o ambiente iniciado com dados de demonstração, quando nenhuma falha está ativa, então o serviço aparece operacional e o simulador responde normalmente.
- Dada uma falha de latência ativada no simulador, quando ela satisfaz a regra, então sinal, alerta, estado degradado e incidente podem ser acompanhados com a mesma correlação.
- Dados dois respondentes, quando entram na sala, então veem presença, mensagens, responsabilidade e mudanças em tempo real.
- Dada uma desconexão temporária de um respondente, quando retorna, então recupera as atualizações sem lacunas nem duplicatas.
- Dado o mesmo sinal enviado duas vezes, quando o fluxo termina, então existe uma única avaliação correspondente.
- Dado o processador parado durante uma ativação, quando retorna, então o incidente é criado uma vez com o instante original.
- Dada a normalização do simulador, quando a recuperação é confirmada e o incidente é resolvido, então timeline e indicadores distinguem recuperação técnica de resolução operacional.
- Dado um incidente `high` ou `critical` resolvido, quando a demonstração termina, então existe uma pendência de postmortem baseada na timeline.

Referência: [ADR 0057](../adr/0057-fazer-o-simulador-usar-contratos-publicos.md).

## Cenários de medição aceitos

| Medição | Validação mínima |
| --- | --- |
| `availability` | Valor saudável ou indisponível |
| Latência de health check | Duração não negativa daquela tentativa |
| `latency` externa | `p95` não negativo, período e tamanho da amostra |
| `error_rate` | Valor entre zero e um, período e tamanho da amostra |
| `heartbeat` | Identidade da fonte e instante observado |

Uma regra de `error_rate` pode exigir amostra mínima. Uma regra nunca combina fontes nem naturezas diferentes de latência.

Referências: [ADR 0058](../adr/0058-limitar-as-metricas-iniciais.md), [ADR 0059](../adr/0059-exigir-contexto-para-a-taxa-de-erros.md), [ADR 0060](../adr/0060-distinguir-latencia-de-check-e-latencia-agregada.md).

## Fora do MVP

- Microsserviços e event sourcing.
- Incidente envolvendo mais de um serviço.
- Correlação automática ou fusão de incidentes.
- Propagação de falhas entre dependências.
- Quórum entre fontes ou regiões.
- Métricas e papéis personalizados.
- Escalas de plantão e escalonamento durável.
- Replay de health checks antigos.
- Diagnóstico de causa raiz ou detecção por IA.
- Cobrança, aplicativo móvel e monitoramento completo de infraestrutura.

## Estado da revisão

As decisões conceituais e os valores operacionais inicialmente deixados em aberto foram definidos. Novas dúvidas encontradas durante a implementação deverão voltar ao modelo ou gerar uma decisão específica quando alterarem o comportamento esperado.

## Critério de conclusão

O MVP estará concluído quando:

- Todos os critérios das Fatias 1 e 2 tiverem uma verificação automatizada ou um roteiro reproduzível.
- O UC-17 puder ser executado do início ao fim sem ajustes manuais nos dados internos.
- Os cenários de duplicidade, desconexão, concorrência e atraso de processamento tiverem resultado observável.
- Logs, métricas e traces permitirem seguir ao menos um fluxo completo pela correlação.
- Limitações e pontos ainda não decididos estiverem explícitos na demonstração e na documentação.
