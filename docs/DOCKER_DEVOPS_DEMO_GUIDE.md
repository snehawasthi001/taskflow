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
cd C:\Users\sneha\OneDrive\Desktop\task
```

## 2. First-Time Setup Commands

Run the automated setup once before the demo day. It builds the app/Jenkins images, starts every container, creates the Prisma schema, seeds demo data, configures Nexus, injects Jenkins credentials, provisions the Jenkins pipeline job, restarts Grafana, and warms metrics:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-devops-demo.ps1
```

If your SonarQube admin password is no longer `admin`, pass it explicitly so the script can create the Jenkins analysis token:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-devops-demo.ps1 -SonarUser admin -SonarPassword "YOUR_SONAR_PASSWORD"
```

Manual fallback commands are below if you want to do each step by hand.

```powershell
docker compose build
```

Then start the full platform:

```powershell
docker compose up -d
```

Initialize the local PostgreSQL schema. This is required after a fresh `docker compose down -v` because the Postgres volume is empty:

```powershell
$env:DATABASE_URL='postgresql://taskflow:taskflow_local_password@localhost:5432/taskflow?schema=public'
$env:DIRECT_DATABASE_URL=$env:DATABASE_URL
npx prisma db push
```

Seed the demo workspace, users, teams, projects, tasks, and comments:

```powershell
$env:DATABASE_URL='postgresql://taskflow:taskflow_local_password@localhost:5432/taskflow?schema=public'
$env:DIRECT_DATABASE_URL=$env:DATABASE_URL
npm run db:seed
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
cd C:\Users\sneha\OneDrive\Desktop\task
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
| Prometheus Targets | `http://localhost:9090/targets` | Scrape target health |
| Prometheus Graph | `http://localhost:9090/graph` | Metrics queries |
| Grafana | `http://localhost:3002` | Enterprise dashboard |
| Jenkins | `http://localhost:8085` | CI/CD pipeline |
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
7. Open Jenkins at `http://localhost:8085`.
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

## 5A. What Your Current Logs Mean

Your current Docker status is good:

- `frontend` and `backend` are healthy.
- `postgres` and `redis` are healthy.
- Jenkins, SonarQube, Nexus, Prometheus, and Grafana are running.

The earlier frontend error:

```text
The table public.users does not exist in the current database.
```

means the PostgreSQL container was running, but Prisma had not created the schema yet. Fix it with:

```powershell
$env:DATABASE_URL='postgresql://taskflow:taskflow_local_password@localhost:5432/taskflow?schema=public'
$env:DIRECT_DATABASE_URL=$env:DATABASE_URL
npx prisma db push
npm run db:seed
```

The earlier backend log:

```text
GET /metrics 404
```

meant Prometheus was scraping the backend before the Express metrics endpoint existed. The backend now exposes `http://localhost:3001/metrics`, and Prometheus targets should show `UP`.

The Grafana login error happened because the password was not `admin`. Use:

```text
Username: admin
Password: taskflow
```

If needed, reset it:

```powershell
docker exec taskflow-grafana grafana cli admin reset-admin-password taskflow
```

## 6. Jenkins First-Time Setup

Open:

```text
http://localhost:8085
```

After running `scripts/setup-devops-demo.ps1`, Jenkins automatically creates this job:

```text
http://localhost:8085/job/taskflow-enterprise-pipeline/
```

Click the job, then click **Build Now**. On stage view, explain:

- Checkout from the local Git repository mounted into Jenkins.
- Install dependencies and generate Prisma client.
- Parallel test and lint/type-check stages.
- SonarQube analysis. If the Sonar token was not created, this stage is marked unstable instead of killing the demo.
- Parallel Docker builds for frontend and backend.
- Parallel Trivy image scans with JSON/HTML reports archived.
- Nexus push to the local Docker registry on `localhost:8082`.
- Kubernetes/Helm deployment stage is present but disabled for Docker-only demos. Turn `RUN_K8S_DEPLOY` to `true` and add a kubeconfig credential when using EKS/minikube.

If Jenkins has not been initialized before, get the initial admin password:

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

If Jenkins is still on the Getting Started plugin installation screen, wait until the progress bar completes. Log lines such as `Installation successful` are normal.

Create credentials in Jenkins:

| Credential ID | Type | Purpose |
| --- | --- | --- |
| `nexus-docker-registry` | Username/password | Docker login to Nexus registry |
| `taskflow-kubeconfig` | Secret file | Kubeconfig for real Kubernetes deployment |

For a local-only demo, you can show the pipeline up to image build/scan/push. The real Kubernetes deploy stage is gated to the `main` branch and requires kubeconfig.

Configure the SonarQube scanner tool in Jenkins:

1. Go to `Manage Jenkins`.
2. Open `Tools`.
3. Find `SonarQube Scanner installations`.
4. Add a scanner named exactly:

```text
SonarScanner
```

5. Enable automatic installation.

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

For a local Docker demo, the mounted repository is available inside Jenkins at:

```text
/workspace/taskflow
```

If you do not want to connect a remote Git repository yet, use this SCM URL:

```text
file:///workspace/taskflow
```

Set the branch to your current branch. Your commit output showed `master`, so use:

```text
*/master
```

How to demonstrate Jenkins:

1. Open `http://localhost:8085`.
2. Open `taskflow-enterprise-pipeline`.
3. Click `Build Now`.
4. Open the running build number.
5. Show the stage view: checkout, install, test/lint in parallel, SonarQube, Docker build, Trivy scan, Nexus push, Kubernetes deploy.
6. Explain that deployment is branch-gated, so non-production branches build, test, scan, and publish artifacts without touching production.

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

How to demonstrate Nexus:

1. Open `http://localhost:8081`.
2. Log in as `admin`.
3. Go to `Browse`.
4. After Jenkins pushes images, open `taskflow-docker`.
5. Show SHA/version image tags.
6. Explain that Nexus is the private artifact registry between CI and deployment.

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

How to demonstrate SonarQube:

1. Open `http://localhost:9000`.
2. Open project `TaskFlow`.
3. Show bugs, vulnerabilities, code smells, duplication, and coverage.
4. Open `Quality Gates`.
5. Explain that Jenkins blocks promotion when the quality gate fails.

The local SonarQube screen can show embedded database and version warnings. For this Docker-only university demo, that is acceptable. In production, SonarQube would use an external database and a supported LTS release.

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
sum(rate(taskflow_backend_http_requests_total[5m]))
```

```promql
histogram_quantile(0.95, sum(rate(taskflow_backend_http_request_duration_seconds_bucket[5m])) by (le))
```

```promql
taskflow_backend_process_resident_memory_bytes
```

If a metric does not show yet, generate traffic by clicking around the TaskFlow app or opening `http://localhost:3001/api/health`.

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
- Runtime CPU and memory panels
- Active alerts

This Docker demo dashboard intentionally uses live TaskFlow, backend runtime, and Prometheus target metrics so it does not look empty during a local presentation. Kubernetes-specific metrics are still available in the Helm/Kubernetes manifests for cluster demos.

How to demonstrate Grafana:

1. Open `http://localhost:3002`.
2. Log in with `admin / taskflow`.
3. Open `TaskFlow Enterprise Command Center`.
4. Show availability, request rate, latency, memory, and business KPI panels.
5. Explain that the dashboard reads from Prometheus and gives both engineering and executive visibility.

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

```powershell
curl http://localhost:9090/api/v1/targets
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

### Prisma table does not exist

If frontend logs show `The table public.users does not exist`, initialize and seed the database:

```powershell
$env:DATABASE_URL='postgresql://taskflow:taskflow_local_password@localhost:5432/taskflow?schema=public'
$env:DIRECT_DATABASE_URL=$env:DATABASE_URL
npx prisma db push
npm run db:seed
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
