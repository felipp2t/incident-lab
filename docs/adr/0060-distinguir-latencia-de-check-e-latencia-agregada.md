---
status: accepted
---

# Distinguir latência de check e latência agregada

A latência de um health check representará a duração daquela tentativa individual, enquanto uma medição externa de `latency` representará, no MVP, o percentil 95 de um período e informará janela e quantidade de requisições. Regras compararão somente medições da mesma natureza, sem combinar duração de health check com latência agregada da aplicação.
