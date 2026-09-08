# Decisões arquiteturais

Este índice agrupa as decisões do IncidentLab por assunto. A numeração preserva a ordem em que as decisões foram discutidas; o status de cada uma permanece no próprio arquivo.

## Como ler

O [system design consolidado](../architecture/system-design.md) é a entrada principal, o [modelo conceitual](../architecture/domain-model.md) detalha entidades e consistência, os [contratos de aplicação](../architecture/application-contracts.md) descrevem intenções e fatos e o [vocabulário](../../CONTEXT.md) define os termos canônicos. Estes ADRs preservam o histórico e a justificativa das escolhas.

Nem todos os registros abaixo seriam ADRs clássicos em um projeto maduro: limites entre áreas, consistência, integração e tolerância a falhas são decisões arquiteturais; estados, permissões, retenção e regras de alerta são principalmente políticas de domínio ou produto. Eles foram mantidos aqui para preservar a forma de documentação escolhida nesta primeira rodada, enquanto a visão consolidada evita que a implementação dependa de ler dezenas de arquivos em sequência.

## Forma e limites do sistema

- [0001 — Dividir o domínio por capacidades](./0001-dividir-o-dominio-por-capacidades.md)
- [0002 — Separar sinais, alertas e incidentes](./0002-separar-sinais-alertas-e-incidentes.md)
- [0004 — Manter o estado persistido como fonte da verdade](./0004-manter-o-estado-persistido-como-fonte-da-verdade.md)
- [0048 — Integrar áreas por acontecimentos](./0048-integrar-areas-por-acontecimentos.md)
- [0049 — Permitir visões de leitura combinadas](./0049-permitir-visoes-de-leitura-combinadas.md)
- [0068 — Não adotar event sourcing](./0068-nao-adotar-event-sourcing.md)
- [0077 — Limitar apenas fluxos operacionais no MVP](./0077-limitar-apenas-fluxos-operacionais-no-mvp.md)

## Base técnica

- [0088 — Adotar TypeScript, Fastify e Svelte](./0088-adotar-typescript-fastify-e-svelte.md)
- [0089 — Usar PostgreSQL com Drizzle](./0089-usar-postgresql-com-drizzle.md)
- [0090 — Usar sessões persistidas no PostgreSQL](./0090-usar-sessoes-persistidas-no-postgresql.md)
- [0091 — Persistir outbox sem broker inicial](./0091-persistir-outbox-sem-broker-inicial.md)
- [0092 — Organizar a API por domínio e infraestrutura](./0092-organizar-api-por-dominio-e-infraestrutura.md)

## Organizações e acesso

- [0014 — Usar papéis fixos por organização](./0014-usar-papeis-fixos-por-organizacao.md)
- [0035 — Isolar dados por organização](./0035-isolar-dados-por-organizacao.md)
- [0036 — Revogar acesso sem apagar autoria](./0036-revogar-acesso-sem-apagar-autoria.md)
- [0084 — Propagar alterações de papel sem remover o vínculo](./0084-propagar-alteracoes-de-papel-sem-remover-o-vinculo.md)

## Sinais, fontes e regras

- [0007 — Versionar regras durante a avaliação](./0007-versionar-regras-durante-a-avaliacao.md)
- [0008 — Tornar a ingestão de sinais idempotente](./0008-tornar-a-ingestao-de-sinais-idempotente.md)
- [0009 — Não reavaliar o estado com sinais atrasados](./0009-nao-reavaliar-o-estado-com-sinais-atrasados.md)
- [0010 — Tratar ausência de sinais como condição explícita](./0010-tratar-ausencia-de-sinais-como-condicao-explicita.md)
- [0011 — Separar confirmação e recuperação do alerta](./0011-separar-confirmacao-e-recuperacao-do-alerta.md)
- [0030 — Permitir desativar regras com alertas ativos](./0030-permitir-desativar-regras-com-alertas-ativos.md)
- [0034 — Confirmar sinais somente após aceitação durável](./0034-confirmar-sinais-somente-apos-aceitacao-duravel.md)
- [0039 — Serializar avaliação por serviço e regra](./0039-serializar-avaliacao-por-servico-e-regra.md)
- [0041 — Preservar evidências mínimas do alerta](./0041-preservar-evidencias-minimas-do-alerta.md)
- [0045 — Exigir evidências ao longo da janela](./0045-exigir-evidencias-ao-longo-da-janela.md)
- [0058 — Limitar as métricas iniciais](./0058-limitar-as-metricas-iniciais.md)
- [0059 — Exigir contexto para a taxa de erros](./0059-exigir-contexto-para-a-taxa-de-erros.md)
- [0060 — Distinguir latência de check e latência agregada](./0060-distinguir-latencia-de-check-e-latencia-agregada.md)
- [0061 — Avaliar uma fonte por regra](./0061-avaliar-uma-fonte-por-regra.md)
- [0062 — Validar a regra contra a frequência da fonte](./0062-validar-a-regra-contra-a-frequencia-da-fonte.md)
- [0063 — Aceitar ou rejeitar o sinal inteiro](./0063-aceitar-ou-rejeitar-o-sinal-inteiro.md)
- [0070 — Limitar condições de regra por métrica no MVP](./0070-limitar-condicoes-de-regra-por-metrica-no-mvp.md)
- [0071 — Definir semântica temporal dos sinais](./0071-definir-semantica-temporal-dos-sinais.md)
- [0086 — Usar arquivamento como corte para sinais pendentes](./0086-usar-arquivamento-como-corte-para-sinais-pendentes.md)

## Serviços e health checks

- [0027 — Derivar o estado do serviço dos impactos ativos](./0027-derivar-o-estado-do-servico-dos-alertas.md)
- [0028 — Não propagar falhas entre dependências](./0028-nao-propagar-falhas-entre-dependencias.md)
- [0029 — Arquivar serviços com histórico](./0029-arquivar-servicos-com-historico.md)
- [0031 — Distinguir falha do serviço e falha do monitoramento](./0031-distinguir-falha-do-servico-e-falha-do-monitoramento.md)
- [0032 — Impedir execuções sobrepostas de health checks](./0032-impedir-execucoes-sobrepostas-de-health-checks.md)
- [0033 — Não reproduzir health checks perdidos](./0033-nao-reproduzir-health-checks-perdidos.md)
- [0037 — Limitar cada incidente a um serviço](./0037-limitar-cada-incidente-a-um-servico.md)
- [0064 — Permitir impacto operacional em incidentes manuais](./0064-permitir-impacto-operacional-em-incidentes-manuais.md)
- [0076 — Classificar resultados de health check](./0076-classificar-resultados-de-health-check.md)
- [0080 — Integrar impactos manuais por acontecimentos específicos](./0080-integrar-impactos-manuais-por-acontecimentos-especificos.md)
- [0085 — Coordenar abertura manual e arquivamento por serviço](./0085-coordenar-abertura-manual-e-arquivamento-por-servico.md)

## Ciclo de vida dos incidentes

- [0003 — Correlacionar incidente por serviço e regra](./0003-correlacionar-incidente-por-servico-e-regra.md)
- [0005 — Tornar a resolução do incidente terminal](./0005-tornar-a-resolucao-do-incidente-terminal.md)
- [0006 — Inicializar a severidade a partir da regra](./0006-inicializar-a-severidade-a-partir-da-regra.md)
- [0012 — Garantir a criação do incidente após ativação](./0012-garantir-a-criacao-do-incidente-apos-ativacao.md)
- [0013 — Atribuir um responsável principal ao incidente](./0013-atribuir-um-responsavel-principal-ao-incidente.md)
- [0015 — Controlar a atribuição do responsável principal](./0015-controlar-a-atribuicao-do-responsavel-principal.md)
- [0016 — Rejeitar alterações baseadas em versões antigas](./0016-rejeitar-alteracoes-baseadas-em-versoes-antigas.md)
- [0017 — Manter a timeline imutável](./0017-manter-a-timeline-imutavel.md)
- [0025 — Exigir postmortem sem bloquear a resolução](./0025-exigir-postmortem-sem-bloquear-a-resolucao.md)
- [0026 — Separar tempos de detecção, recuperação e resolução](./0026-separar-tempos-de-deteccao-recuperacao-e-resolucao.md)
- [0042 — Não registrar cada sinal na timeline](./0042-nao-registrar-cada-sinal-na-timeline.md)
- [0043 — Relacionar incidentes duplicados sem mescla](./0043-relacionar-incidentes-duplicados-sem-mescla.md)
- [0044 — Classificar a resolução do incidente](./0044-classificar-a-resolucao-do-incidente.md)
- [0046 — Permitir resolver com alerta ainda ativo](./0046-permitir-resolver-com-alerta-ainda-ativo.md)
- [0081 — Publicar mudanças de incidente como fatos específicos](./0081-publicar-mudancas-de-incidente-como-fatos-especificos.md)
- [0082 — Não transportar a nota interna na resolução](./0082-nao-transportar-a-nota-interna-na-resolucao.md)
- [0073 — Separar postmortem interno e resumo público](./0073-separar-postmortem-interno-e-resumo-publico.md)

## Colaboração e tempo real

- [0018 — Separar conversa e timeline](./0018-separar-conversa-e-timeline.md)
- [0019 — Manter mensagens imutáveis](./0019-manter-mensagens-imutaveis.md)
- [0020 — Tratar presença como informação efêmera](./0020-tratar-presenca-como-informacao-efemera.md)
- [0021 — Recuperar atualizações por sequência](./0021-recuperar-atualizacoes-por-sequencia.md)
- [0022 — Tornar comandos do cliente idempotentes](./0022-tornar-comandos-do-cliente-idempotentes.md)
- [0052 — Permitir operação sem tempo real](./0052-permitir-operacao-sem-tempo-real.md)
- [0069 — Não manter lista persistente de participantes no MVP](./0069-nao-manter-lista-persistente-de-participantes-no-mvp.md)
- [0075 — Permitir conversa por sete dias após a resolução](./0075-permitir-conversa-por-sete-dias-apos-a-resolucao.md)
- [0087 — Restringir o acesso a conteúdo ocultado](./0087-restringir-o-acesso-a-conteudo-ocultado.md)

## Comunicação e status público

- [0023 — Desacoplar notificações do incidente](./0023-desacoplar-notificacoes-do-incidente.md)
- [0024 — Publicar incidentes automaticamente com conteúdo seguro](./0024-publicar-incidentes-automaticamente-com-conteudo-seguro.md)
- [0047 — Notificar membros conforme a severidade](./0047-notificar-membros-conforme-a-severidade.md)
- [0065 — Separar estado interno e estado público](./0065-separar-estado-interno-e-estado-publico.md)
- [0066 — Separar históricos interno e público](./0066-separar-historicos-interno-e-publico.md)
- [0067 — Separar disponibilidade e cobertura](./0067-separar-disponibilidade-e-cobertura.md)
- [0072 — Usar notificações internas e e-mail no MVP](./0072-usar-notificacoes-internas-e-email-no-mvp.md)
- [0079 — Consultar Organizações para resolver a audiência](./0079-consultar-organizacoes-para-resolver-audiencia.md)
- [0083 — Publicar projeção pública completa e sanitizada](./0083-publicar-projecao-publica-completa-e-sanitizada.md)

## Confiabilidade e observabilidade

- [0038 — Confirmar estado, timeline e divulgação juntos](./0038-confirmar-estado-timeline-e-divulgacao-juntos.md)
- [0040 — Aplicar retenção finita aos sinais brutos](./0040-aplicar-retencao-finita-aos-sinais-brutos.md)
- [0050 — Assumir entrega repetida de acontecimentos](./0050-assumir-entrega-repetida-de-acontecimentos.md)
- [0051 — Isolar falhas sem quebrar a ordem da entidade](./0051-isolar-falhas-sem-quebrar-a-ordem-da-entidade.md)
- [0053 — Degradar com processamento assíncrono indisponível](./0053-degradar-com-processamento-assincrono-indisponivel.md)
- [0054 — Não confirmar escritas sem a fonte da verdade](./0054-nao-confirmar-escritas-sem-a-fonte-da-verdade.md)
- [0055 — Propagar causalidade e correlação](./0055-propagar-causalidade-e-correlacao.md)
- [0056 — Combinar automonitoramento e observação externa](./0056-combinar-automonitoramento-e-observacao-externa.md)
- [0057 — Fazer o simulador usar contratos públicos](./0057-fazer-o-simulador-usar-contratos-publicos.md)
- [0074 — Definir retenção por finalidade no MVP](./0074-definir-retencao-por-finalidade-no-mvp.md)
- [0078 — Padronizar repetições assíncronas no MVP](./0078-padronizar-repeticoes-assincronas-no-mvp.md)

## Status

- `accepted`: todos os ADRs numerados neste índice.
