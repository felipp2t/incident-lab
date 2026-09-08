# Roteiro de implementação do IncidentLab

Status: pronto para detalhamento

Este roteiro transforma o [MVP aceito](../requirements/mvp.md) em entregas verticais sem escolher linguagens, frameworks, bancos, protocolos ou infraestrutura. A ordem indica dependências de comportamento, não duração nem organização de equipes.

## Regra de execução

Cada fatia deve entregar um comportamento observável de ponta a ponta. Estruturas internas, persistência, interfaces, processamento e experiência de uso entram somente quando forem necessárias para concluir a fatia corrente.

Idempotência, isolamento por organização, autorização, causalidade e capacidade de diagnóstico não são uma fase posterior: devem acompanhar desde o início todo fluxo ao qual se aplicam.

## Definição de concluído de uma fatia

Uma fatia está concluída quando:

- seu resultado pode ser demonstrado sem alteração manual de dados internos;
- os critérios de aceite relacionados possuem verificação automatizada ou roteiro reproduzível;
- caminhos de sucesso, recusa, repetição e concorrência aplicáveis foram exercitados;
- cada área altera somente os dados que controla;
- dados de outra organização não são revelados em respostas ou falhas;
- identidades, causa e correlação permitem acompanhar o fluxo;
- degradações conhecidas são visíveis sem apresentar sucesso falso;
- o vocabulário e os documentos continuam coerentes com o comportamento entregue.

## Visão das dependências

| Fatia | Resultado principal | Depende de |
| --- | --- | --- |
| 1 | Incidente manual completo | — |
| 2 | Sala colaborativa recuperável | 1 |
| 3 | Sinal externo até incidente automático | 1 |
| 4 | Health check e simulador | 3 |
| 5 | Recuperação e ciclo operacional completo | 3 e 4 |
| 6 | Notificações e mudanças de vínculo | 5 |
| 7 | Status público seguro | 5 |
| 8 | Postmortem e indicadores | 5 |
| 9 | Retenção e degradação controlada | 2 a 8 |
| 10 | Demonstração integral do portfólio | 9 |

Depois da fatia 1, as fatias 2 e 3 podem avançar independentemente. Depois da fatia 5, notificações, status público e postmortem também podem avançar em paralelo.

## Rastreabilidade dos casos de uso

O mapeamento indica onde cada caso de uso é introduzido ou concluído. Restrições transversais continuam valendo em todas as fatias aplicáveis.

| Caso de uso | Fatias |
| --- | --- |
| UC-01 — Controlar acesso por organização | 1 e 6 |
| UC-02 — Cadastrar e arquivar serviço | 1 e 5 |
| UC-03 — Configurar regra de alerta | 3, 4 e 5 |
| UC-04 — Aceitar sinais externos | 3 |
| UC-05 — Executar health checks | 4 |
| UC-06 — Avaliar ativação e recuperação | 3 e 5 |
| UC-07 — Abrir e correlacionar incidente automático | 3 e 5 |
| UC-08 — Abrir incidente manual | 1 e 5 |
| UC-09 — Coordenar e resolver incidente | 1 e 5 |
| UC-10 — Colaborar e recuperar sala | 2 |
| UC-11 — Notificar equipe | 6 |
| UC-12 — Publicar status seguro | 7 |
| UC-13 — Produzir postmortem | 8 |
| UC-14 — Calcular estado e indicadores | 3, 5 e 8 |
| UC-15 — Reter histórico e evidências | 9 |
| UC-16 — Degradar e recuperar sem perder trabalho | transversal, concluído na 9 |
| UC-17 — Demonstrar fluxo de ponta a ponta | 4, 5 e 10 |

## Fatia 1 — Abrir e resolver um incidente manual

### Resultado observável

Uma organização consegue cadastrar um serviço ativo, abrir um incidente manual, coordená-lo e resolvê-lo com histórico confiável.

### Inclui

- criação da organização e do primeiro `admin`;
- vínculos com papéis fixos e isolamento entre organizações;
- cadastro mínimo de serviço monitorado;
- abertura manual com severidade e impacto operacional declarado;
- atribuição, transferência e remoção do responsável principal;
- mudanças válidas de estado e severidade;
- controle de concorrência por versão do incidente;
- timeline inicial e entradas das mudanças operacionais;
- resolução terminal com resultado e nota interna;
- acontecimentos específicos das mudanças, ainda que inicialmente não possuam consumidores externos.

### Prova de conclusão

Dois usuários disputam uma alteração do mesmo incidente. Uma mudança vence, a outra recebe o estado atual sem sobrescrevê-lo, e o incidente termina resolvido com timeline e autoria preservadas.

### Adiado

Monitoramento automático, conversa, tempo real, notificações e publicação pública.

## Fatia 2 — Colaborar e recuperar a sala

### Resultado observável

Respondentes colaboram em uma sala e recuperam exatamente as mudanças perdidas durante uma desconexão.

### Inclui

- mensagens imutáveis e simultâneas;
- promoção única de mensagem para a timeline;
- sequência monotônica de atualizações da sala;
- retomada por intervalo e fallback para retrato completo autorizado;
- presença efêmera separada da participação e da responsabilidade;
- escrita por sete dias após a resolução;
- ocultação e restauração independentes de mensagem e nota promovida;
- histórico de moderação restrito a `admins`;
- consulta auditada do conteúdo ocultado;
- operação persistida quando a distribuição em tempo real estiver indisponível.

### Prova de conclusão

Um respondente se desconecta, outro envia mensagens e altera o incidente, e o primeiro retorna sem lacunas ou duplicações. Conteúdo ocultado não aparece no retrato normal nem para um `admin`.

## Fatia 3 — Transformar um sinal externo em incidente automático

### Resultado observável

Uma fonte externa envia evidências de indisponibilidade, a regra ativa e um único incidente automático é criado.

### Inclui

- cadastro de fonte externa e credencial vinculada;
- ingestão atômica e idempotente de sinais;
- limites por fonte e organização antes da aceitação;
- instantes observado e recebido, frescor e desvio de relógio;
- regra versionada de disponibilidade com ativação e recuperação independentes;
- avaliação serial por `serviço + regra`;
- evidências permanentes mínimas do alerta;
- criação garantida ou correlação do incidente automático;
- severidade inicial e impacto copiados da versão da regra;
- atualização do estado operacional do serviço.

### Prova de conclusão

O mesmo sinal é entregue duas vezes. Existe um sinal aceito, uma transição de alerta e um incidente automático, todos acompanháveis pela mesma correlação.

### Adiado

Health checks próprios, latência, taxa de erros, heartbeat e comunicação externa.

## Fatia 4 — Observar falhas com health check e simulador

### Resultado observável

Uma pessoa provoca uma falha no simulador e o IncidentLab a detecta pelos mesmos contratos usados para monitorar um alvo real.

### Inclui

- agendamento de health checks sem sobreposição ou replay de horários perdidos;
- classificação entre falha observada do alvo e lacuna de monitoramento;
- disponibilidade e latência produzidas por cada tentativa;
- regras de latência e taxa de erros com contexto de medição válido;
- heartbeat para fontes com frequência esperada;
- simulador de indisponibilidade, latência e erro;
- cobertura desconhecida quando falta evidência confiável.

### Prova de conclusão

Aumentar a latência do simulador produz sinais válidos, ativa a regra correspondente e abre um incidente. Parar o executor reduz cobertura sem atribuir falsamente uma falha ao serviço.

## Fatia 5 — Completar recuperação e ciclo operacional

### Resultado observável

O sistema distingue recuperação técnica, continuidade do trabalho humano e resolução operacional em todos os caminhos centrais.

### Inclui

- confirmação independente da recuperação do alerta;
- recuperação tardia registrada sem reabrir incidente resolvido;
- reincidência correlacionada ao incidente automático ainda não resolvido;
- novo incidente depois que o anterior foi resolvido;
- interrupção administrativa de alerta sem afirmar recuperação;
- resolução explícita enquanto o alerta permanece ativo;
- alteração e encerramento de impactos de incidentes manuais;
- cálculo agregado do estado operacional;
- coordenação entre abertura manual, obrigação automática e arquivamento;
- corte administrativo para sinais ainda não avaliados;
- restauração do serviço sem reaproveitar contagens antigas.

### Prova de conclusão

Uma falha ativa um alerta e abre um incidente; a normalização recupera tecnicamente o alerta; a equipe resolve depois. Timeline e indicadores preservam os três instantes e seus significados diferentes.

## Marco A — Caminho funcional

As fatias 1 a 5 concluem a Fatia 1 do MVP. Nesse marco já é possível executar o fluxo central do portfólio sem notificações, página pública ou postmortem completo.

## Fatia 6 — Notificar sem acoplar o incidente

### Resultado observável

Membros elegíveis recebem comunicações conforme a severidade sem tornar a entrega condição para confirmar o incidente.

### Inclui

- audiência resolvida pelos vínculos vigentes em Organizações;
- notificação interna persistente para todas as severidades;
- entrega de e-mail conforme severidade e política;
- identidades independentes por solicitação, destinatário e canal;
- repetição de falhas temporárias e encerramento de falhas permanentes;
- cancelamento da entrega externa quando o vínculo perde elegibilidade;
- efeitos de remoção de membro e alteração de papel;
- conteúdo externo deliberadamente seguro.

### Prova de conclusão

Uma falha temporária de e-mail não desfaz o incidente nem duplica a entrega lógica. Remover o membro antes do próximo envio cancela apenas sua entrega pendente.

## Fatia 7 — Publicar status seguro

### Resultado observável

Um visitante acompanha um incidente publicado sem possuir qualquer acesso aos registros internos.

### Inclui

- publicação automática apenas quando autorizada pela regra;
- publicação explícita de incidente manual;
- textos públicos seguros para as mudanças permitidas;
- projeção pública completa, sanitizada e versionada;
- consumo idempotente sem consulta às áreas internas;
- histórico e estado públicos independentes dos internos;
- indicação do instante da última atualização quando a projeção estiver atrasada;
- decisão humana ao resolver enquanto o alerta ainda estiver ativo.

### Prova de conclusão

A página aplica uma versão mais nova, ignora uma repetida e uma antiga e continua exibindo a última cópia conhecida quando sua origem fica indisponível, sem receber conversa, timeline ou nota interna.

## Fatia 8 — Explicar o incidente e medir a resposta

### Resultado observável

A equipe conclui um postmortem e consulta indicadores que distinguem saúde, cobertura e tempos da resposta.

### Inclui

- postmortem obrigatório sem bloquear a resolução de incidentes `high` e `critical`;
- postmortem opcional para demais severidades;
- ciclos `pendente`, `rascunho` e `concluído`;
- ações preventivas textuais no MVP;
- resumo público revisado e publicado explicitamente;
- disponibilidade e cobertura calculadas separadamente;
- tempos de detecção, recuperação técnica e resolução operacional;
- históricos interno e público calculados de suas próprias fontes.

### Prova de conclusão

Um incidente crítico resolvido cria uma pendência de postmortem. Sua conclusão não altera o incidente, e uma edição posterior não modifica o resumo público até nova confirmação explícita.

## Fatia 9 — Provar retenção e degradação controlada

### Resultado observável

Falhas parciais e remoções por retenção possuem resultados previsíveis, recuperáveis e observáveis.

### Inclui

- retomada ordenada do processamento assíncrono;
- repetição com a mesma identidade e política de intervalos definida;
- isolamento de falha por entidade sem bloquear fluxos independentes;
- intervenção sobre acontecimentos isolados;
- operação sem distribuição em tempo real;
- recusa de escrita quando a fonte da verdade não pode confirmar segurança;
- retenção por finalidade para sinais, mensagens, notificações, entregas e acontecimentos processados;
- preservação de evidências, timeline, incidentes, postmortem e auditoria;
- processo excepcional e auditado de exclusão legal;
- cenários concorrentes e atrasados aplicados aos fluxos já entregues.

### Prova de conclusão

O processamento é interrompido durante uma ativação e depois retomado. O incidente aparece uma vez, com o instante original, enquanto outra entidade continua avançando e todo o fluxo mantém causa e correlação.

## Fatia 10 — Fechar a demonstração do portfólio

### Resultado observável

Uma pessoa executa o cenário completo do UC-17 e observa tanto o valor do produto quanto suas garantias arquiteturais.

### Inclui

- dados de demonstração reproduzíveis;
- jornada guiada do simulador à resolução e ao postmortem;
- cenários de duplicidade, concorrência, desconexão e atraso;
- falhas parciais controladas e recuperação observável;
- verificações de carga sobre os limites declarados;
- correlação navegável do fluxo completo;
- registro explícito de limitações ainda existentes;
- roteiro de demonstração e critério objetivo de sucesso.

### Prova de conclusão

O UC-17 é executado do início ao fim sem ajustes manuais nos dados internos, e cada comportamento de falha previsto possui resultado observável e repetível.

## Marco B — MVP de portfólio

As fatias 6 a 10 completam a Fatia 2 do MVP. O próximo planejamento deve detalhar somente a fatia prestes a começar; as posteriores permanecem neste nível para não antecipar decisões de implementação.

## Próximo detalhamento

A fatia 1 foi convertida em um [backlog de comportamentos demonstráveis](./slice-01-backlog.md), mantendo cada item atravessando autorização, domínio, persistência e interface necessária. Escolhas tecnológicas e desenho físico serão tratados separadamente quando forem necessários para executar esse backlog.
