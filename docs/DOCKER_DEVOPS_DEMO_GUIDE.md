# TaskFlow Docker DevOps Demo Guide

Use this guide to demonstrate the TaskFlow DevOps toolchain in front of your university audience.

This guide focuses on the local Docker demo stack:

- TaskFlow frontend
- TaskFlow backend
- PostgreSQL
- Redis
- Jenkins
- SonarQube
- Nexus
- Prometheus
- Grafana

## 1. Prerequisites

Install and start these before the demo:

- Docker Desktop
- Git
- Node.js 20, optional but useful for local checks

Confirm Docker is working:

```powershell
docker version
docker compose version
```

Go to the project folder:

```powershell
cd C:\Users\sneha\OneDrive\Desktop\task\taskflow
```

## 2. First-Time Setup Commands

Run these once before the demo day.

```powershell
docker compose build
```

Then start the full platform:

```powershell
docker compose up -d
```

Check all containers:

```powershell
docker compose ps
```

Watch startup logs:

```powershell
docker compose logs -f
```

Stop watching logs with `Ctrl+C`. This does not stop the containers.

## 3. Second Time Onwards

For future demo runs, use:

```powershell
cd C:\Users\sneha\OneDrive\Desktop\task\taskflow
docker compose up -d
```

If you changed Dockerfiles or configs:

```powershell
docker compose up -d --build
```

To stop everything:

```powershell
docker compose down
```

To stop and delete local data volumes, only if you want a clean reset:

```powershell
docker compose down -v
```

## 4. Localhost URLs To Open

| Tool | URL | What To Show |
| --- | --- | --- |
| TaskFlow App | `http://localhost:3000` | The product running from Docker |
| Backend API | `http://localhost:3001/api/health` | Backend health check |
| Backend Metrics | `http://localhost:3001/metrics` | Prometheus metrics endpoint |
| Prometheus | `http://localhost:9090` | Scrape targets, queries, alerts |
| Grafana | `http://localhost:3002` | Enterprise dashboard |
| Jenkins | `http://localhost:8080` | CI/CD pipeline |
| SonarQube | `http://localhost:9000` | Quality/security analysis |
| Nexus | `http://localhost:8081` | Artifact registry |
| Nexus Docker Registry | `localhost:8082` | Private Docker registry endpoint |

Grafana login:

```text
Username: admin
Password: taskflow
```

## 5. Recommended Demo Flow

Use this order on stage:

1. Open TaskFlow at `http://localhost:3000`.
2. Open backend health at `http://localhost:3001/api/health`.
3. Open Prometheus targets at `http://localhost:9090/targets`.
4. Open Grafana at `http://localhost:3002`.
5. Open SonarQube at `http://localhost:9000`.
6. Open Nexus at `http://localhost:8081`.
7. Open Jenkins at `http://localhost:8080`.
8. Explain the pipeline:

```text
Developer Push
-> Jenkins
-> Test + Lint
-> SonarQube
-> Docker Build
-> Trivy Scan
-> Nexus Push
-> Helm/Kubernetes Deploy
-> Prometheus
-> Grafana
```

## 6. Jenkins First-Time Setup

Open:

```text
http://localhost:8080
```

Get the initial admin password:

```powershell
docker exec taskflow-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Install suggested Jenkins plugins. Also ensure these Jenkins plugins are available:

- Pipeline
- Git
- Credentials
- JUnit
- HTML Publisher
- SonarQube Scanner

Create credentials in Jenkins:

| Credential ID | Type | Purpose |
| --- | --- | --- |
| `nexus-docker-registry` | Username/password | Docker login to Nexus registry |
| `taskflow-kubeconfig` | Secret file | Kubeconfig for real Kubernetes deployment |

For a local-only demo, you can show the pipeline up to image build/scan/push. The real Kubernetes deploy stage is gated to the `main` branch and requires kubeconfig.

Create the Jenkins pipeline:

1. Click `New Item`.
2. Choose `Pipeline`.
3. Name it `taskflow-enterprise-pipeline`.
4. Select `Pipeline script from SCM`.
5. SCM: Git.
6. Repository: your local/remote TaskFlow repository.
7. Script Path:

```text
jenkins/Jenkinsfile
```

## 7. Nexus First-Time Setup

Open:

```text
http://localhost:8081
```

Get the admin password:

```powershell
docker exec taskflow-nexus cat /nexus-data/admin.password
```

Login:

```text
Username: admin
Password: value from the command above
```

Create a Docker hosted repository:

1. Go to `Settings`.
2. Go to `Repositories`.
3. Click `Create repository`.
4. Choose `docker (hosted)`.
5. Name:

```text
taskflow-docker
```

6. HTTP port:

```text
8082
```

7. Enable Docker Bearer Token Realm if Nexus asks for Docker login support.
8. Save.

Jenkins pushes images to:

```text
localhost:8082/taskflow/frontend
localhost:8082/taskflow/backend
```

## 8. SonarQube First-Time Setup

Open:

```text
http://localhost:9000
```

Default login:

```text
Username: admin
Password: admin
```

SonarQube will ask you to change the password.

Create a project:

```text
Project key: taskflow
Project name: TaskFlow
```

Generate a token and add it to Jenkins SonarQube configuration.

In Jenkins:

1. Go to `Manage Jenkins`.
2. Go to `System`.
3. Add SonarQube server.
4. Name it exactly:

```text
SonarQube
```

5. URL:

```text
http://sonarqube:9000
```

## 9. Prometheus Demo

Open:

```text
http://localhost:9090
```

Check targets:

```text
http://localhost:9090/targets
```

Useful demo queries:

```promql
up
```

```promql
sum(rate(taskflow_http_requests_total[5m]))
```

```promql
histogram_quantile(0.95, sum(rate(taskflow_http_request_duration_seconds_bucket[5m])) by (le))
```

```promql
taskflow_websocket_connections
```

```promql
taskflow_queue_jobs_total
```

If a metric does not show yet, generate traffic by clicking around the TaskFlow app.

## 10. Grafana Demo

Open:

```text
http://localhost:3002
```

Login:

```text
Username: admin
Password: taskflow
```

Open dashboard:

```text
TaskFlow Enterprise Command Center
```

What to explain:

- Service availability
- API throughput
- p95 latency
- Error budget burn
- WebSocket sessions
- Task business KPIs
- Queue health
- Auth/security signal
- Kubernetes CPU and memory panels
- Active alerts

Some Kubernetes panels may show empty locally unless Prometheus is running inside a Kubernetes cluster with kube-state-metrics/cAdvisor metrics. That is expected for the Docker-only demo.

## 11. Trivy Demo

Trivy is installed inside the custom Jenkins image.

The Jenkins pipeline runs:

```text
scripts/scan-image.sh
```

It creates:

```text
trivy-reports/frontend.json
trivy-reports/frontend.html
trivy-reports/backend.json
trivy-reports/backend.html
```

It fails the pipeline if HIGH or CRITICAL vulnerabilities are found.

## 12. Docker Commands For Each Service

Start only infrastructure:

```powershell
docker compose up -d postgres redis prometheus grafana jenkins sonarqube nexus
```

Start only the app:

```powershell
docker compose up -d backend frontend
```

Restart one service:

```powershell
docker compose restart jenkins
```

View logs for one service:

```powershell
docker compose logs -f jenkins
```

View logs for app:

```powershell
docker compose logs -f frontend backend
```

Rebuild app images:

```powershell
docker compose build frontend backend
docker compose up -d frontend backend
```

## 13. Health Check Commands

```powershell
docker compose ps
```

```powershell
curl http://localhost:3000/api/health
```

```powershell
curl http://localhost:3001/api/health
```

```powershell
curl http://localhost:3001/metrics
```

## 14. Common Errors And Fixes

### Port already in use

Check what is using a port:

```powershell
netstat -ano | findstr :3000
```

Stop the conflicting process or change the port in `docker-compose.yml`.

### Docker Desktop is not running

Start Docker Desktop, wait until it says Docker is running, then run:

```powershell
docker compose up -d
```

### Jenkins asks for initial password again

That means the Jenkins volume was deleted. Get the password again:

```powershell
docker exec taskflow-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Nexus is slow to start

Nexus can take 1-3 minutes. Check:

```powershell
docker compose logs -f nexus
```

### SonarQube is slow to start

SonarQube can also take a few minutes. Check:

```powershell
docker compose logs -f sonarqube
```

### Prometheus target is down

Check app containers:

```powershell
docker compose ps frontend backend
```

Check logs:

```powershell
docker compose logs -f frontend backend prometheus
```

### Clean reset

Use only when you want to remove all local Jenkins/Sonar/Nexus/Grafana/Postgres data:

```powershell
docker compose down -v
docker compose up -d --build
```

## 15. What To Say During The Demo

Short script:

```text
TaskFlow is not just a web app. It is wrapped in a production-grade DevOps platform.
Every change can pass through Jenkins, quality gates in SonarQube, Docker image builds,
Trivy vulnerability scanning, Nexus artifact storage, Kubernetes deployment,
Prometheus monitoring, and Grafana executive dashboards.
```

Then show:

1. TaskFlow app running.
2. Prometheus targets.
3. Grafana dashboard.
4. Jenkins pipeline.
5. SonarQube project.
6. Nexus Docker registry.

## 16. Before Demo Day Checklist

- `docker compose up -d` works.
- `docker compose ps` shows all services running.
- TaskFlow opens on `http://localhost:3000`.
- Grafana opens and dashboard is visible.
- Prometheus targets page opens.
- Jenkins initial setup is already completed.
- Nexus Docker hosted repository exists on port `8082`.
- SonarQube project `taskflow` exists.
- Browser tabs are pre-opened in the recommended order.
