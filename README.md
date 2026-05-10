# TaskFlow

TaskFlow is a full-stack task management and team collaboration platform. The application code is already built; this repository now also includes a production-grade DevOps platform around it.

## Run Locally

```bash
npm install
npm run dev
```

App: `http://localhost:3000`

## Run The Full DevOps Demo Stack

```bash
docker compose up --build
```

Included services:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3002`
- Jenkins: `http://localhost:8085`
- SonarQube: `http://localhost:9000`
- Nexus: `http://localhost:8081`
- PostgreSQL and Redis

## Enterprise DevOps Runbook

Read the full implementation guide here:

`docs/ENTERPRISE_DEVOPS.md`

It documents every generated DevOps file, why it exists, how it integrates, and what production values you need to provide.
