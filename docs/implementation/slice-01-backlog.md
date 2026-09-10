# Backlog da Fatia 1 — Incidente manual

Status: pronto para estimativa técnica

Este backlog detalha a primeira fatia do [roteiro de implementação](./roadmap.md). Ele descreve comportamentos e provas de conclusão sem escolher tecnologias nem decompor o trabalho por camadas técnicas.

## Objetivo da fatia

Uma organização cadastra um serviço, abre um incidente manual, coordena a resposta e o resolve com autorização, concorrência, autoria e histórico confiáveis.

## Premissas de recorte

- A identidade da pessoa já está autenticada; cadastro, convite, recuperação de acesso e escolha de provedor não pertencem a esta fatia.
- A associação inicial de um novo membro usa uma identidade já conhecida pelo sistema.
- O serviço possui somente o cadastro mínimo necessário para receber um incidente manual.
- O impacto operacional é declarado e sua obrigação de integração é preservada, mas o recálculo completo da saúde do serviço pertence à fatia 5.
- Acontecimentos são confirmados com suas mudanças desde o início, mesmo que alguns consumidores sejam introduzidos em fatias posteriores.
- Distribuição em tempo real, conversa, notificações, página pública e postmortem não integram esta fatia.

## Regra para os itens

Cada item precisa atravessar a apresentação necessária, a intenção da aplicação, as regras do domínio, a persistência durável e suas verificações. Trabalho técnico de suporte fica dentro do primeiro item que dele necessita e não constitui entrega isolada.

Todo comando mutável deve seguir as convenções de identidade, organização, autoria, idempotência, causa e correlação definidas nos [contratos de aplicação](../architecture/application-contracts.md).

## Ordem do backlog

- [x] S1-01 — Criar uma organização
- [ ] S1-02 — Associar membros e aplicar papéis
- [ ] S1-03 — Cadastrar um serviço monitorado
- [ ] S1-04 — Abrir um incidente manual
- [ ] S1-05 — Consultar o incidente e seu histórico
- [ ] S1-06 — Coordenar a responsabilidade principal
- [ ] S1-07 — Alterar estado e severidade
- [ ] S1-08 — Resolver o incidente

Os itens devem ser concluídos nessa ordem. S1-06 e S1-07 podem avançar em paralelo depois de S1-05, mas ambos precisam estar concluídos antes da prova integrada de S1-08.

## S1-01 — Criar uma organização

### Comportamento entregue

Uma pessoa autenticada sem vínculo cria uma organização e torna-se seu primeiro membro com papel `admin`.

### Critérios de aceite

- A organização recebe identidade própria e fica separada de todas as demais.
- O vínculo do criador como primeiro `admin` é confirmado junto com a organização.
- A organização criada passa a ser o contexto ativo da pessoa.
- Repetir o mesmo comando devolve a organização original sem criar outra.
- Tentar reutilizar a identidade do comando com conteúdo diferente produz conflito.
- Uma falha de confirmação não apresenta a organização como criada.

### Prova

Repetir a criação depois de simular a perda da primeira resposta continua resultando em uma organização e um vínculo administrativo.

### Rastreabilidade

UC-01; ADRs 0014, 0035 e 0036.

## S1-02 — Associar membros e aplicar papéis

### Comportamento entregue

Um `admin` associa identidades conhecidas à organização como `respondente` ou `visualizador`, e cada pessoa atua somente conforme seu vínculo no contexto atual.

### Critérios de aceite

- Somente um `admin` vigente gerencia vínculos nesta fatia.
- Um mesmo usuário pode possuir papéis diferentes em organizações diferentes.
- `Respondentes` podem operar incidentes, mas não administrar membros ou serviços.
- `Visualizadores` podem consultar, mas não executar alterações.
- Consultas e comandos nunca revelam a existência de dados pertencentes a outra organização.
- Mudar o contexto ativo passa a aplicar o papel do vínculo correspondente.
- Repetir a associação confirmada não cria um segundo vínculo para `organização + usuário`.

### Prova

A mesma pessoa atua como `respondente` em uma organização e `visualizador` em outra; uma tentativa de alteração no segundo contexto é recusada sem revelar dados do primeiro.

### Rastreabilidade

UC-01; `Vínculo organizacional`; ADRs 0014 e 0035.

## S1-03 — Cadastrar um serviço monitorado

### Comportamento entregue

Um `admin` cadastra o serviço ativo que poderá receber incidentes manuais.

### Critérios de aceite

- O serviço pertence exatamente à organização do contexto autenticado.
- O cadastro exige somente sua identidade descritiva mínima e começa ativo.
- O serviço não começa como saudável sem evidência; seu estado operacional inicial é `desconhecido`.
- `Respondentes` e `visualizadores` não podem cadastrar ou alterar serviços.
- Um membro não consegue consultar, alterar ou relacionar um serviço de outra organização.
- Repetir o mesmo comando devolve o serviço original sem duplicá-lo.

### Prova

O `admin` cadastra um serviço e o `respondente` consegue selecioná-lo para resposta, enquanto um usuário de outra organização não consegue confirmar sequer sua existência.

### Rastreabilidade

UC-02; `Serviço monitorado`; ADRs 0027, 0029, 0035 e 0037.

## S1-04 — Abrir um incidente manual

### Comportamento entregue

Um `respondente` ou `admin` abre uma resposta humana para um serviço ativo com severidade e impacto operacional declarado.

### Critérios de aceite

- Serviço, severidade e impacto são obrigatórios; o impacto pode declarar nenhuma contribuição.
- O serviço é confirmado como existente, ativo e pertencente à organização antes da criação.
- Serviço inexistente, de outra organização ou arquivado não produz incidente.
- Se o cadastro oficial do serviço não puder ser consultado com segurança, nada é confirmado e o comando pode ser repetido.
- O incidente começa manual, privado, `aberto`, sem responsável obrigatório e em sua versão inicial.
- Incidente, primeira entrada da timeline, primeira atualização da sala e obrigação de `IncidenteAberto` são confirmados juntos.
- Um impacto diferente de nenhuma contribuição também confirma a obrigação de `ImpactoOperacionalDeclarado`.
- Repetir o comando devolve o mesmo incidente; reutilizar sua identidade com outro conteúdo produz conflito.

### Prova

Depois da perda da resposta de abertura, repetir o comando devolve o mesmo incidente e não duplica timeline, atualização da sala ou acontecimentos.

### Rastreabilidade

UC-08; `AbrirIncidenteManual`; `IncidenteAberto`; ADRs 0037, 0064, 0080 e 0085.

## S1-05 — Consultar o incidente e seu histórico

### Comportamento entregue

Um membro autorizado encontra o incidente e consulta seu estado atual junto da timeline oficial já confirmada.

### Critérios de aceite

- A visão apresenta serviço, origem manual, estado, severidade, versão e responsável atual.
- A timeline apresenta abertura e mudanças confirmadas em ordem, com autoria e instante.
- A nota interna de resolução só aparece para membros autorizados da organização.
- `Admins`, `respondentes` e `visualizadores` podem consultar; as permissões de alteração continuam distintas.
- Incidentes de outra organização não aparecem em listagens, buscas, relações ou respostas de erro.
- A visão combinada é somente leitura e não se torna proprietária dos dados que reúne.

### Prova

Um `visualizador` acompanha o incidente e sua timeline, mas toda tentativa de alteração é recusada; no contexto de outra organização, o incidente não é revelado.

### Rastreabilidade

UC-01, UC-08 e UC-09; ADRs 0035 e 0049.

## S1-06 — Coordenar a responsabilidade principal

### Comportamento entregue

Respondentes definem claramente quem coordena o incidente sem confundir responsabilidade com papel ou participação.

### Critérios de aceite

- Um `respondente` ou `admin` pode assumir um incidente sem responsável.
- Outro `respondente` não pode tomar um incidente já atribuído.
- O responsável atual pode transferir a responsabilidade para outro `respondente` ou `admin` vigente.
- Um `admin` pode substituir ou remover o responsável.
- Toda alteração exige a versão observada do incidente.
- Duas tentativas concorrentes sobre a mesma versão resultam em uma vencedora; a outra recebe conflito e o estado atual.
- A mudança confirma juntos responsável, nova versão, timeline, atualização da sala e obrigação de `ResponsavelPrincipalAlterado`.
- Repetir o mesmo comando não repete nenhum desses efeitos.

### Prova

Dois respondentes tentam assumir simultaneamente um incidente sem responsável. Somente um vence, e o histórico mostra uma única atribuição.

### Rastreabilidade

UC-09; `Responsável principal`; ADRs 0013, 0015, 0016, 0038 e 0081.

## S1-07 — Alterar estado e severidade

### Comportamento entregue

A equipe representa o andamento e o impacto conhecido do incidente por transições explícitas e concorrentes com segurança.

### Critérios de aceite

- As transições não terminais permitidas são `aberto → investigando`, `investigando → monitorando` e `monitorando → investigando`.
- Uma transição não prevista é recusada sem efeito parcial.
- `Respondentes` e `admins` podem alterar estado e severidade; `visualizadores` não podem.
- Estado e severidade permanecem conceitos independentes.
- Toda mudança exige a versão observada e incrementa a versão uma vez.
- Alterar estado confirma timeline, atualização da sala e `EstadoDoIncidenteAlterado` junto da nova versão.
- Alterar severidade confirma timeline, atualização da sala e `SeveridadeDoIncidenteAlterada` junto da nova versão.
- Repetições devolvem o resultado anterior, e concorrentes baseados em versão antiga não sobrescrevem a vencedora.

### Prova

Uma mudança válida de estado e uma mudança de severidade partem da mesma versão. A primeira confirmada vence, e a segunda precisa ser refeita sobre a versão atual.

### Rastreabilidade

UC-09; `Incidente`; `Severidade`; ADRs 0016, 0038 e 0081.

## S1-08 — Resolver o incidente

### Comportamento entregue

Um `respondente` ou `admin` encerra terminalmente o trabalho operacional com resultado e contexto internos preservados.

### Critérios de aceite

- A resolução exige versão observada, resultado, nota interna, autoria e instante.
- Os resultados aceitos são `mitigado`, `recuperado`, `falso positivo` e `duplicado`.
- O resultado `duplicado` exige um incidente principal válido da mesma organização e mantém os históricos separados.
- A resolução pode partir de qualquer estado não terminal.
- Resolver confirma juntos estado terminal, versão, timeline, atualização da sala e obrigação de `IncidenteResolvido`.
- Um impacto manual vigente também confirma `ImpactoOperacionalEncerrado`.
- `IncidenteResolvido` contém o resultado e os dados operacionais mínimos, mas nunca a nota interna.
- Depois da resolução, alterações de estado, severidade e responsabilidade são recusadas.
- Uma versão antiga recebe conflito sem resolução parcial.
- Repetir o comando confirmado devolve o mesmo resultado sem duplicar efeitos.

### Prova

O incidente percorre abertura, atribuição, investigação, monitoramento e resolução. A consulta interna mostra a nota, o acontecimento de resolução não a contém e uma nova alteração operacional é recusada.

### Rastreabilidade

UC-09; `ResolverIncidente`; `IncidenteResolvido`; ADRs 0005, 0016, 0038, 0043, 0044, 0080, 0081 e 0082.

## Prova integrada da Fatia 1

Com duas organizações e três papéis disponíveis:

1. Um `admin` cadastra um serviço.
2. Um `respondente` abre um incidente manual com impacto `degradado`.
3. Dois respondentes disputam a responsabilidade e somente um vence.
4. Uma alteração concorrente de estado ou severidade recebe conflito e é refeita sobre a versão atual.
5. O incidente percorre `aberto → investigando → monitorando → resolvido`.
6. Um `visualizador` acompanha o resultado sem poder alterá-lo.
7. Um membro da outra organização não encontra o serviço nem o incidente.
8. Repetir os comandos confirmados não duplica incidentes, timeline, atualizações ou acontecimentos.

A fatia termina quando esse roteiro pode ser executado sem alteração manual dos dados internos e suas garantias possuem verificação automatizada ou roteiro reproduzível.

## Fora da Fatia 1

- convite, cadastro e recuperação de identidade;
- alteração ou remoção de vínculos com reações em consumidores posteriores;
- arquivamento e restauração de serviços;
- fontes, sinais, regras, alertas e health checks;
- cálculo completo do estado operacional a partir de impactos;
- mensagens, presença, moderação e distribuição em tempo real;
- notificações e entregas externas;
- publicação pública e postmortem;
- políticas completas de retenção e cenários de degradação assíncrona.

Esses comportamentos permanecem nas fatias posteriores do [roteiro](./roadmap.md).
