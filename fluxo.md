flowchart LR
  Sources[Fontes monitoradas] --> Intake[Coleta e ingestão]
  Intake --> Signals[Sinais normalizados]
  Signals --> Evaluation[Avaliação de regras]
  Evaluation --> Alerts[Alertas]
  Alerts --> Incidents[Gestão de incidentes]

  Responders[Respondentes] --> Incidents
  Incidents --> Timeline[Timeline]
  Timeline --> Live[Atualizações em tempo real]
  Timeline --> Reports[Postmortem]
  Incidents --> Notifications[Notificações]
  Incidents --> Status[Status público]