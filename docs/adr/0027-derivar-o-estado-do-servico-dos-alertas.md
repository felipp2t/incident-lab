---
status: accepted
---

# Derivar o estado do serviço dos impactos ativos

O estado operacional de um serviço será `operacional`, `degradado`, `indisponível` ou `desconhecido`, e cada regra definirá o impacto produzido quando seu alerta estiver ativo. Incidentes manuais também poderão declarar impacto operacional enquanto estiverem ativos. Entre os impactos vigentes será aplicada a precedência `indisponível`, `degradado`, `desconhecido` e `operacional`, nessa ordem; assim, falta de dados não esconderá uma falha já confirmada. Alertas pendentes não alterarão o estado oficial, e o serviço somente voltará a `operacional` quando não houver impacto ativo nem falta de dados necessários. Esse estado permanecerá separado da severidade do incidente, pois saúde técnica e impacto organizacional não são equivalentes.
