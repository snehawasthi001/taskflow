# TaskFlow Enterprise DevOps Presentation Handbook

This document is your complete study guide and live-demo runbook for presenting TaskFlow as an enterprise-grade DevOps platform. It explains what each tool does, why it exists in this project, how it connects to the rest of the system, what commands to run, what screens to show, and how to answer common questions from engineers, recruiters, architects, CTOs, and judges.

Use this together with:

- `docs/DOCKER_DEVOPS_DEMO_GUIDE.md`
- `docs/ENTERPRISE_DEVOPS.md`
- `jenkins/Jenkinsfile`
- `docker-compose.yml`
- `prometheus/prometheus.yml`
- `grafana/dashboards/taskflow-dashboard.json`
- `helm/taskflow/`
- `terraform/`
- `kubernetes/`
- `ansible/`

## 1. Executive Summary

TaskFlow is a production-style task management and team collaboration platform. The application is already built; the DevOps layer productionizes it with CI/CD, artifact management, containerization, scanning, infrastructure as code, orchestration, monitoring, alerting, and cloud deployment patterns.

The demo story is:

```text
Developer commit
-> Husky and commitlint checks
-> Jenkins pipeline trigger
-> Install dependencies
-> Test and lint in parallel
-> SonarQube code quality scan
-> Docker image build
-> Trivy image vulnerability scan
-> Nexus Docker registry push
-> Helm/Kubernetes deployment gate
-> Prometheus metrics scrape
-> Grafana executive dashboard
```

The important message for the audience:

TaskFlow is not just an app. It is a full software delivery platform that demonstrates how modern teams build, secure, ship, observe, and operate software.

## 2. Local Demo URLs

After the platform is running, these are the URLs to open:

| Service | URL | Purpose | Default Credentials |
|---|---|---|---|
| TaskFlow frontend | http://localhost:3000 | Main application UI | Demo app user: `alex@taskflow.dev` / `Password123` after seed |
| TaskFlow backend health | http://localhost:3001/api/health | Backend API health check | None |
| Jenkins | http://localhost:8085 | CI/CD pipeline | Jenkins admin user configured during setup |
| SonarQube | http://localhost:9000 | Code quality and security analysis | Your local Sonar admin credentials |
| Nexus | http://localhost:8081 | Artifact and Docker registry UI | Nexus admin credentials |
| Nexus Docker registry | localhost:8082 | Docker push/pull endpoint | Nexus admin credentials |
| Prometheus | http://localhost:9090 | Metrics and alert rules | None |
| Grafana | http://localhost:3002 | Dashboards and visualization | `admin` / `taskflow` |
| PostgreSQL | localhost:5432 | Application database | `taskflow` / `taskflow_local_password` |
| Redis | localhost:6379 | Cache, queue, realtime support | None in local demo |

## 3. Architecture Overview

```mermaid
flowchart LR
  Developer["Developer / Git Commit"] --> Hooks["Husky + commitlint"]
  Hooks --> Jenkins["Jenkins Pipeline"]
  Jenkins --> TestLint["Parallel Test + Lint"]
  TestLint --> Sonar["SonarQube Quality Scan"]
  Sonar --> Docker["Docker Build"]
  Docker --> Trivy["Trivy CVE Scan"]
  Trivy --> Nexus["Nexus Docker Registry"]
  Nexus --> Helm["Helm Release"]
  Helm --> K8s["Kubernetes / EKS"]
  K8s --> Prometheus["Prometheus Scraping"]
  Prometheus --> Grafana["Grafana Dashboards"]
```

Runtime architecture:

```mermaid
flowchart TB
  Browser["Browser"] --> Frontend["Next.js Frontend"]
  Frontend --> NextApi["Next.js API Routes"]
  Frontend --> Backend["Express Backend API"]
  Backend --> Postgres["PostgreSQL"]
  NextApi --> Postgres
  Backend --> Redis["Redis"]
  Backend --> Socket["Socket.io Realtime"]
  Backend --> BullMQ["BullMQ Queue"]
  Prometheus["Prometheus"] --> FrontendMetrics["Frontend /api/metrics"]
  Prometheus --> BackendMetrics["Backend /metrics"]
  Grafana["Grafana"] --> Prometheus
```

## 4. One-Time Local Setup

Run these commands from PowerShell:

```powershell
cd C:\Users\sneha\OneDrive\Desktop\task
docker version
docker compose version
```

Start the full DevOps platform:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-devops-demo.ps1 -SonarUser admin -SonarPassword "YOUR_SONAR_PASSWORD" -NexusUser admin -NexusPassword "YOUR_NEXUS_PASSWORD"
```

If you do not know the Nexus password, get it from the container:

```powershell
docker exec taskflow-nexus sh -lc "cat /nexus-data/admin.password"
```

Verify all containers:

```powershell
docker compose ps
```

Expected services:

```text
taskflow-frontend
taskflow-backend
taskflow-postgres
taskflow-redis
taskflow-jenkins
taskflow-sonarqube
taskflow-nexus
taskflow-prometheus
taskflow-grafana
```

## 5. Second-Time Demo Startup

When containers and volumes already exist:

```powershell
cd C:\Users\sneha\OneDrive\Desktop\task
docker compose up -d
docker compose ps
```

Warm metrics for Grafana:

```powershell
1..5 | ForEach-Object {
  Invoke-WebRequest -Uri "http://localhost:3000/api/metrics" -UseBasicParsing | Out-Null
  Invoke-WebRequest -Uri "http://localhost:3001/metrics" -UseBasicParsing | Out-Null
  Invoke-WebRequest -Uri "http://localhost:3000/api/tasks" -UseBasicParsing | Out-Null
  Invoke-WebRequest -Uri "http://localhost:3000/api/projects" -UseBasicParsing | Out-Null
  Start-Sleep -Seconds 2
}
```

Open:

```text
http://localhost:3000
http://localhost:8085/job/taskflow-enterprise-pipeline/
http://localhost:3002/d/taskflow-enterprise/taskflow-enterprise-command-center
http://localhost:9090/targets
http://localhost:9000
http://localhost:8081
```

## 6. Reset Commands

Restart the platform without deleting data:

```powershell
docker compose restart
```

Stop the platform:

```powershell
docker compose down
```

Full reset, including database and tool data:

```powershell
docker compose down -v
```

Only rebuild Jenkins after Jenkinsfile or Jenkins Docker image changes:

```powershell
docker compose build jenkins
docker compose up -d --force-recreate jenkins
```

Only rebuild application images:

```powershell
docker compose build frontend backend
docker compose up -d --force-recreate frontend backend
```

## 7. Git, Husky, and commitlint

### Definition

Git is the source control system. Husky runs local Git hooks. commitlint enforces Conventional Commits.

### Purpose In TaskFlow

They prevent low-quality commits from entering the pipeline. The project expects commit messages like:

```text
feat: add project dashboard
fix: repair docker build in jenkins
docs: add devops presentation handbook
chore: update helm values
```

### Files

| File | Purpose |
|---|---|
| `.husky/pre-commit` | Runs staged checks before commit |
| `.husky/commit-msg` | Validates commit message format |
| `commitlint.config.js` | Defines Conventional Commit rules |
| `.github/PULL_REQUEST_TEMPLATE.md` | Gives reviewers a repeatable review checklist |
| `package.json` | Contains `prepare`, `lint`, `type-check`, and `lint-staged` config |

### Commands

Check status:

```powershell
git status
```

Stage specific files:

```powershell
git add docs/TASKFLOW_DEVOPS_PRESENTATION_HANDBOOK.md
```

Commit with a valid message:

```powershell
git commit -m "docs: add taskflow devops presentation handbook"
```

If commitlint rejects a message like `first commit`, use:

```powershell
git commit -m "feat: initial taskflow platform setup"
```

### Best Practice

Conventional Commits make release notes, changelogs, semantic versioning, and pipeline rules easier to automate.

### Questions You May Get

Q: Why enforce commit message format?

A: Because enterprise teams need traceability. A consistent commit history helps code review, release notes, automated versioning, and incident investigation.

Q: Why run pre-commit checks locally if Jenkins also checks?

A: Local hooks catch errors early. Jenkins is still the authoritative gate, but local checks reduce wasted CI time.

Official docs:

- https://git-scm.com/doc
- https://typicode.github.io/husky/
- https://commitlint.js.org/
- https://www.conventionalcommits.org/

## 8. Docker

### Definition

Docker packages an application and its runtime dependencies into portable container images.

### Purpose In TaskFlow

TaskFlow uses Docker for repeatable local demos, CI image builds, production-style packaging, and artifact promotion through Nexus.

### Files

| File | Purpose |
|---|---|
| `docker/Dockerfile.frontend` | Builds the Next.js frontend image |
| `docker/Dockerfile.backend` | Builds the Express backend image |
| `docker-compose.yml` | Runs the full local DevOps ecosystem |
| `.dockerignore` | Keeps images small and avoids copying secrets/noise |

### Enterprise Practices Used

- Multi-stage builds
- Non-root runtime users
- Health checks
- Smaller production runtime layers
- Separate frontend/backend images
- Compose network isolation
- Persistent volumes for stateful tools

### Commands

Build all images:

```powershell
docker compose build
```

Build only app images:

```powershell
docker compose build frontend backend
```

Run everything:

```powershell
docker compose up -d
```

View containers:

```powershell
docker compose ps
```

View logs:

```powershell
docker compose logs --tail=120 frontend
docker compose logs --tail=120 backend
docker compose logs --tail=120 jenkins
docker compose logs --tail=120 sonarqube
docker compose logs --tail=120 nexus
```

Check frontend health:

```powershell
Invoke-WebRequest http://localhost:3000/api/health -UseBasicParsing
```

Check backend health:

```powershell
Invoke-WebRequest http://localhost:3001/api/health -UseBasicParsing
```

### Demo Talking Point

Docker proves the app can run consistently across laptops, CI agents, and Kubernetes nodes.

Official docs:

- https://docs.docker.com/
- https://docs.docker.com/compose/
- https://docs.docker.com/build/building/best-practices/

## 9. Jenkins

### Definition

Jenkins is the CI/CD automation server. It runs the pipeline that validates, builds, scans, publishes, and deploys the application.

### Purpose In TaskFlow

Jenkins is the main delivery engine. It shows the full enterprise delivery chain from source code to deployable artifact.

### Files

| File | Purpose |
|---|---|
| `jenkins/Jenkinsfile` | Declarative enterprise pipeline |
| `jenkins/Dockerfile` | Custom Jenkins image with Docker CLI, kubectl, Helm, Trivy, AWS CLI, Node.js, Sonar scanner |
| `jenkins/init.groovy.d/` | Bootstraps Jenkins jobs and credentials for demo |
| `scripts/setup-devops-demo.ps1` | Injects demo credentials and recreates Jenkins |

### Pipeline Stages

| Stage | What It Proves |
|---|---|
| Checkout | Jenkins can read source code |
| Install | Dependencies install cleanly |
| 3a Test | Unit tests and coverage run |
| 3b Lint | ESLint, TypeScript, and audit checks run |
| SonarQube | Code quality and security analysis run |
| Docker Preflight | Jenkins can access Docker engine |
| Docker Build | Frontend/backend images build in parallel |
| Trivy Scan | Container images are vulnerability scanned |
| Nexus Push | Images are pushed to private registry |
| Kubernetes Deploy | Helm deployment is gated for main branch and real cluster credentials |
| Post Actions | Workspace cleanup and logout happen even after failures |

### Why Some Stages Look Skipped

Jenkins does not run later stages if an earlier required stage fails. That is normal CI/CD behavior. If Docker Build fails, Trivy Scan, Nexus Push, and Kubernetes Deploy are skipped because there are no valid images to scan, publish, or deploy. Post Actions still run because cleanup must always happen.

### Commands

Open Jenkins:

```text
http://localhost:8085/job/taskflow-enterprise-pipeline/
```

Verify Docker inside Jenkins:

```powershell
docker exec taskflow-jenkins docker version
```

Verify Jenkins can see the mounted repo:

```powershell
docker exec taskflow-jenkins sh -lc "ls -la /workspace/taskflow && git -C /workspace/taskflow status --short"
```

Rerun Jenkins container:

```powershell
docker compose up -d --force-recreate jenkins
```

Trigger pipeline manually:

1. Open Jenkins.
2. Open `taskflow-enterprise-pipeline`.
3. Click `Build Now`.
4. Open the latest build.
5. Show the stage graph.

### Best Practice

The Jenkinsfile uses:

- Declarative syntax
- Parallel stages
- Timeouts
- Build retention
- Workspace cleanup
- Credential bindings
- Branch gating
- Post actions
- Non-hardcoded secrets

### Questions You May Get

Q: Why Jenkins and not GitHub Actions?

A: This project intentionally demonstrates Jenkins because it is common in enterprise environments, supports private networks, has mature plugin ecosystems, and can integrate with Nexus, SonarQube, Kubernetes, and on-prem infrastructure.

Q: Why does deploy only run from main/master?

A: Production deployments should not happen from every feature branch. Branch gating reduces accidental releases.

Q: Why use parallel stages?

A: Tests, linting, image builds, and scans can run concurrently, reducing feedback time.

Official docs:

- https://www.jenkins.io/doc/book/pipeline/
- https://www.jenkins.io/doc/book/using/

## 10. SonarQube

### Definition

SonarQube performs static code analysis for bugs, code smells, vulnerabilities, duplications, maintainability, and quality gates.

### Purpose In TaskFlow

SonarQube proves the codebase is measured against objective engineering standards before artifacts are promoted.

### Files

| File | Purpose |
|---|---|
| `sonar-project.properties` | Defines project key, sources, exclusions, coverage paths, and quality settings |
| `jenkins/Jenkinsfile` | Runs `sonar-scanner` during CI |

### Commands

Open SonarQube:

```text
http://localhost:9000
```

Manual scanner command from Windows if needed:

```powershell
sonar-scanner.bat -D"sonar.projectKey=taskflow" -D"sonar.sources=." -D"sonar.host.url=http://localhost:9000" -D"sonar.token=YOUR_SONAR_TOKEN"
```

Manual scanner command from Jenkins container:

```powershell
docker exec taskflow-jenkins sh -lc "cd /workspace/taskflow && sonar-scanner -Dsonar.host.url=http://sonarqube:9000 -Dsonar.token=YOUR_SONAR_TOKEN"
```

### How To Show It

1. Open SonarQube.
2. Open `TaskFlow`.
3. Show `Overview`.
4. Show `Issues`.
5. Show `Security Hotspots`.
6. Show `Measures`.
7. Explain that Jenkins pushes analysis results automatically.

### Important Note

The banner saying the SonarQube version is no longer active is a product lifecycle warning for the demo image version. It does not mean your scan is broken. For production, upgrade the SonarQube Docker image to a supported version and test plugin compatibility.

### Best Practice

Quality gates stop poor code from being promoted. In production, enforce thresholds like:

- Coverage >= 70 percent
- Zero critical bugs
- Zero blocker vulnerabilities
- Low duplication
- Maintainability rating threshold

Official docs:

- https://docs.sonarsource.com/sonarqube-community-build/
- https://docs.sonarsource.com/sonarqube-community-build/analyzing-source-code/scanners/sonarscanner/

## 11. Nexus Repository

### Definition

Nexus Repository stores and serves build artifacts. In this project, it acts as a private Docker registry.

### Purpose In TaskFlow

Nexus is the artifact promotion layer. Jenkins builds images and pushes them to Nexus instead of deploying untracked local images.

### Files

| File | Purpose |
|---|---|
| `nexus/docker-hosted-repository.json` | Defines the desired Docker hosted repository shape |
| `scripts/setup-devops-demo.ps1` | Auto-creates the Docker hosted repo on port 8082 when credentials are valid |
| `jenkins/Jenkinsfile` | Logs in and pushes images |

### URLs

```text
Nexus UI:              http://localhost:8081
Docker registry port: localhost:8082
Repository name:      taskflow-docker
```

### Commands

Login to local Nexus Docker registry:

```powershell
docker login localhost:8082 -u admin -p YOUR_NEXUS_PASSWORD
```

Tag and push frontend:

```powershell
docker tag taskflow/frontend:local localhost:8082/taskflow/frontend:demo
docker push localhost:8082/taskflow/frontend:demo
```

Tag and push backend:

```powershell
docker tag taskflow/backend:local localhost:8082/taskflow/backend:demo
docker push localhost:8082/taskflow/backend:demo
```

Pull image back:

```powershell
docker pull localhost:8082/taskflow/frontend:demo
```

### If Port 8082 Shows An Error

Port `8082` is not a browser UI. It is the Docker registry connector. Opening it in Chrome may show an error or blank response. That is expected. Use `http://localhost:8081` for the Nexus UI and use Docker CLI for `localhost:8082`.

If creating a second Docker repo fails with `Port must be unique`, it means `taskflow-docker` already owns port `8082`. Do not create another repository on the same port. Use the existing `taskflow-docker` repo.

### Best Practice

Private artifact registries provide traceability and repeatable deployments. Production images should be tagged with:

- Semantic version: `1.0.0`
- Git SHA: `b9cad58`
- Build version: `1.0.0-b9cad58`
- `latest` only for main/master, never for untrusted branches

Official docs:

- https://help.sonatype.com/en/sonatype-nexus-repository.html

## 12. Trivy

### Definition

Trivy scans container images, filesystems, and dependencies for vulnerabilities and misconfigurations.

### Purpose In TaskFlow

Trivy gives the pipeline a security gate before images are pushed to Nexus or deployed.

### Files

| File | Purpose |
|---|---|
| `scripts/scan-image.sh` | Runs Trivy image scans and writes reports |
| `jenkins/Jenkinsfile` | Runs frontend and backend scans in parallel |
| `trivy-reports/` | Jenkins archives reports from this folder during pipeline runs |

### Commands

Scan local frontend:

```powershell
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image taskflow/frontend:local
```

Inside Jenkins pipeline, the script runs:

```bash
sh scripts/scan-image.sh IMAGE_NAME REPORT_NAME
```

### Best Practice

Security scanning should run before publishing images. Critical and high vulnerabilities should be reviewed before production deployment.

Official docs:

- https://trivy.dev/latest/

## 13. Terraform

### Definition

Terraform is infrastructure as code. It defines cloud resources declaratively and applies them repeatably.

### Purpose In TaskFlow

Terraform defines the AWS infrastructure needed for a production deployment: VPC, ECR, EKS, IAM, networking, and supporting state resources.

### Files

| File | Purpose |
|---|---|
| `terraform/bootstrap/main.tf` | Creates S3 state bucket and DynamoDB lock table |
| `terraform/backend.tf` | Configures remote state backend |
| `terraform/main.tf` | Wires infrastructure modules |
| `terraform/variables.tf` | Defines configurable inputs |
| `terraform/outputs.tf` | Prints important outputs |
| `terraform/terraform.tfvars.example` | Example environment values |
| `terraform/modules/vpc/` | VPC, subnets, NAT, routing |
| `terraform/modules/ecr/` | AWS container registries |
| `terraform/modules/eks/` | Kubernetes cluster and managed node groups |

### Commands

Bootstrap remote state:

```powershell
cd C:\Users\sneha\OneDrive\Desktop\task\terraform\bootstrap
terraform init
terraform plan
terraform apply
```

Provision infrastructure:

```powershell
cd C:\Users\sneha\OneDrive\Desktop\task\terraform
copy terraform.tfvars.example terraform.tfvars
terraform init
terraform validate
terraform plan
terraform apply
```

Destroy lab infrastructure when done:

```powershell
terraform destroy
```

### Best Practice

Terraform gives reviewable infrastructure changes, state locking, reusable modules, and reproducible cloud environments.

Official docs:

- https://developer.hashicorp.com/terraform/docs

## 14. AWS

### Definition

AWS is the cloud provider used for production-style hosting.

### Purpose In TaskFlow

AWS hosts the scalable runtime platform:

- VPC for isolated networking
- Public/private subnets across availability zones
- EKS for Kubernetes orchestration
- ECR for managed image storage
- IAM for least-privilege access
- CloudWatch for cloud-native logs and metrics
- S3 and DynamoDB for Terraform remote state and locking

### Commands

Check identity:

```powershell
aws sts get-caller-identity
```

Configure AWS CLI:

```powershell
aws configure
```

Update kubeconfig for EKS:

```powershell
aws eks update-kubeconfig --region ap-south-1 --name taskflow-prod
```

### Best Practice

The production design keeps workloads in private subnets, uses managed EKS node groups, and separates infrastructure provisioning from application deployment.

Official docs:

- https://docs.aws.amazon.com/
- https://docs.aws.amazon.com/eks/latest/userguide/what-is-eks.html

## 15. Kubernetes

### Definition

Kubernetes orchestrates containers across a cluster. It handles scheduling, service discovery, rolling updates, health checks, and scaling.

### Purpose In TaskFlow

Kubernetes is the production runtime target. It runs frontend and backend as separate deployments with services, health checks, autoscaling, config, secrets, and network policies.

### Files

| File | Purpose |
|---|---|
| `kubernetes/namespace.yaml` | Isolates TaskFlow resources |
| `kubernetes/deployment.yaml` | Defines frontend/backend pods and rollout strategy |
| `kubernetes/service.yaml` | Provides stable networking |
| `kubernetes/ingress.yaml` | Routes external traffic |
| `kubernetes/hpa.yaml` | Autoscaling rules |
| `kubernetes/network-policy.yaml` | Network isolation |
| `kubernetes/configmap.yaml` | Non-secret configuration |
| `kubernetes/secret.yaml` | Secret placeholders |

### Commands

Validate manifests without applying:

```powershell
kubectl apply --dry-run=client -f kubernetes/
```

Apply manifests:

```powershell
kubectl apply -f kubernetes/
```

Check pods:

```powershell
kubectl get pods -n taskflow
```

Check rollout:

```powershell
kubectl rollout status deployment/taskflow-frontend -n taskflow
kubectl rollout status deployment/taskflow-backend -n taskflow
```

Rollback:

```powershell
kubectl rollout undo deployment/taskflow-frontend -n taskflow
kubectl rollout undo deployment/taskflow-backend -n taskflow
```

### Best Practice

Use readiness probes for traffic safety, liveness probes for self-healing, rolling updates for zero downtime, HPA for scale, and network policies for containment.

Official docs:

- https://kubernetes.io/docs/home/

## 16. Helm

### Definition

Helm is the package manager for Kubernetes. It templates Kubernetes manifests and manages releases.

### Purpose In TaskFlow

Helm turns Kubernetes YAML into reusable, environment-specific releases for dev, staging, and production.

### Files

| File | Purpose |
|---|---|
| `helm/taskflow/Chart.yaml` | Chart metadata |
| `helm/taskflow/values.yaml` | Default values |
| `helm/taskflow/values-dev.yaml` | Local/minikube settings |
| `helm/taskflow/values-staging.yaml` | Staging settings |
| `helm/taskflow/values-prod.yaml` | Production settings |
| `helm/taskflow/templates/` | Reusable Kubernetes templates |

### Commands

Lint chart:

```powershell
helm lint helm/taskflow
```

Render templates:

```powershell
helm template taskflow helm/taskflow -f helm/taskflow/values-dev.yaml
```

Install or upgrade:

```powershell
helm upgrade --install taskflow helm/taskflow -n taskflow --create-namespace -f helm/taskflow/values-dev.yaml
```

Rollback:

```powershell
helm history taskflow -n taskflow
helm rollback taskflow 1 -n taskflow
```

### Best Practice

Helm enables repeatable deployments, environment-specific values, atomic upgrades, and rollback history.

Official docs:

- https://helm.sh/docs/

## 17. Prometheus

### Definition

Prometheus is a metrics collection and alerting system.

### Purpose In TaskFlow

Prometheus scrapes TaskFlow metrics from:

- Frontend: `http://frontend:3000/api/metrics`
- Backend: `http://backend:3001/metrics`

### Files

| File | Purpose |
|---|---|
| `prometheus/prometheus.yml` | Local Docker Compose scrape config |
| `prometheus/prometheus-kubernetes.yml` | Kubernetes scrape config |
| `prometheus/rules/taskflow-alerts.yml` | Alerting rules |
| `src/app/api/metrics/route.ts` | Frontend/API business metrics endpoint |

### Important Metrics

| Metric | Meaning |
|---|---|
| `up` | Whether Prometheus can scrape a target |
| `taskflow_uptime_seconds` | App uptime |
| `taskflow_http_requests_total` | Request counts by method/path/status |
| `taskflow_http_request_duration_seconds_bucket` | Request latency histogram |
| `taskflow_tasks_total` | Tasks grouped by workflow status |
| `taskflow_projects_total` | Active projects |
| `taskflow_users_total` | Registered users |
| `taskflow_team_members_total` | Team memberships |
| `taskflow_comments_total` | Collaboration comments |
| `taskflow_notifications_total` | Notification counts |
| `taskflow_queue_jobs_total` | Queue jobs by state |
| `taskflow_websocket_connections` | Realtime connection count |
| `taskflow_auth_failures_total` | Authentication failure counter |
| `taskflow_sprint_confidence_percent` | Business delivery confidence |
| `taskflow_cycle_time_days` | Average cycle time |
| `taskflow_delivery_risk_active` | Active delivery risks |

### Queries To Demo

Open:

```text
http://localhost:9090/targets
```

PromQL examples:

```promql
up
taskflow_tasks_total
sum(taskflow_tasks_total)
taskflow_projects_total
taskflow_websocket_connections
sum(rate(taskflow_http_requests_total[5m]))
histogram_quantile(0.95, sum(rate(taskflow_http_request_duration_seconds_bucket[5m])) by (le))
taskflow_queue_jobs_total
taskflow_sprint_confidence_percent
```

### Best Practice

Prometheus separates metrics from logs and enables alerting on service-level and business-level behavior.

Official docs:

- https://prometheus.io/docs/introduction/overview/
- https://prometheus.io/docs/prometheus/latest/querying/basics/

## 18. Grafana

### Definition

Grafana visualizes metrics and turns raw Prometheus data into dashboards.

### Purpose In TaskFlow

Grafana is the executive command center for the demo. It shows operational health and business KPIs in one place.

### Files

| File | Purpose |
|---|---|
| `grafana/provisioning/datasources/prometheus.yml` | Auto-connects Grafana to Prometheus |
| `grafana/provisioning/dashboards/dashboards.yml` | Auto-loads dashboards |
| `grafana/dashboards/taskflow-dashboard.json` | Enterprise TaskFlow dashboard |

### Commands

Open dashboard:

```text
http://localhost:3002/d/taskflow-enterprise/taskflow-enterprise-command-center
```

Login:

```text
Username: admin
Password: taskflow
```

Restart Grafana provisioning:

```powershell
docker compose restart grafana
```

Restart Prometheus and Grafana together:

```powershell
docker compose restart prometheus grafana
```

Warm metrics if panels look empty:

```powershell
1..10 | ForEach-Object {
  Invoke-WebRequest -Uri "http://localhost:3000/api/metrics" -UseBasicParsing | Out-Null
  Invoke-WebRequest -Uri "http://localhost:3001/metrics" -UseBasicParsing | Out-Null
  Start-Sleep -Seconds 2
}
```

### What To Show

Show panels for:

- Service availability
- API throughput
- p95 latency
- Error budget burn
- WebSocket sessions
- Business KPI task flow
- Queue health
- Security signal
- Kubernetes CPU/memory placeholders
- Available replicas
- Active alerts
- Top routes
- Active projects
- Notification delivery

### Best Practice

Grafana dashboards should serve both engineers and business stakeholders. TaskFlow combines technical telemetry with product KPIs.

Official docs:

- https://grafana.com/docs/grafana/latest/

## 19. Ansible

### Definition

Ansible is configuration management and server automation.

### Purpose In TaskFlow

Ansible prepares Linux servers with the tools needed to run or administer TaskFlow: Docker, kubectl, Helm, AWS CLI, firewall rules, and utilities.

### Files

| File | Purpose |
|---|---|
| `ansible/ansible.cfg` | Ansible defaults |
| `ansible/inventory/hosts.ini` | Target host inventory |
| `ansible/setup-node.yml` | Idempotent node setup |
| `ansible/playbooks/setup-node.yml` | Wrapper playbook |

### Commands

Dry run:

```powershell
ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/setup-node.yml --check
```

Apply:

```powershell
ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/setup-node.yml
```

### Best Practice

Ansible playbooks should be idempotent, meaning repeated runs converge the server to the same desired state without breaking it.

Official docs:

- https://docs.ansible.com/

## 20. Database, Cache, Queue, and Realtime Layer

### PostgreSQL

TaskFlow uses PostgreSQL for durable application state: users, workspaces, tasks, projects, teams, comments, and notifications.

Commands:

```powershell
$env:DATABASE_URL='postgresql://taskflow:taskflow_local_password@localhost:5432/taskflow?schema=public'
$env:DIRECT_DATABASE_URL=$env:DATABASE_URL
npx prisma db push --schema prisma/schema.prisma
npm run db:seed
```

### Prisma

Prisma is the ORM. It maps TypeScript code to database tables.

Useful commands:

```powershell
npm run db:generate
npm run db:push
npm run db:seed
npm run db:studio
```

### Redis

Redis supports queues, caching, and realtime coordination patterns.

Check Redis:

```powershell
docker exec taskflow-redis redis-cli ping
```

### BullMQ

BullMQ is the queue system. Queue health is exposed through metrics like:

```promql
taskflow_queue_jobs_total
```

### Socket.io

Socket.io powers realtime collaboration signals. The demo metric is:

```promql
taskflow_websocket_connections
```

## 21. Full Live Demo Script

### Step 1: Show The App

Open:

```text
http://localhost:3000
```

Say:

TaskFlow is the product. The rest of the demo shows how this product is built, secured, shipped, and observed.

### Step 2: Show Docker Compose

Run:

```powershell
docker compose ps
```

Say:

This local demo runs the same ecosystem an enterprise team would use: app, database, cache, CI, quality scanning, artifact registry, monitoring, and dashboards.

### Step 3: Trigger Jenkins

Open:

```text
http://localhost:8085/job/taskflow-enterprise-pipeline/
```

Click `Build Now`.

Say:

Jenkins is now executing the delivery workflow. Notice the parallel test/lint and parallel image build stages.

### Step 4: Show SonarQube

Open:

```text
http://localhost:9000
```

Say:

SonarQube gives objective code quality and security feedback. In production, failed quality gates prevent deployment.

### Step 5: Show Nexus

Open:

```text
http://localhost:8081
```

Say:

Nexus stores promoted container images. The deployment system should consume artifacts from a registry, not from a developer laptop.

### Step 6: Show Prometheus

Open:

```text
http://localhost:9090/targets
```

Run queries:

```promql
up
taskflow_tasks_total
taskflow_sprint_confidence_percent
sum(rate(taskflow_http_requests_total[5m]))
```

Say:

Prometheus scrapes both infrastructure and application business metrics.

### Step 7: Show Grafana

Open:

```text
http://localhost:3002/d/taskflow-enterprise/taskflow-enterprise-command-center
```

Say:

Grafana converts raw metrics into a command center for engineers and leadership.

### Step 8: Show Kubernetes And Helm Readiness

Run:

```powershell
helm lint helm/taskflow
helm template taskflow helm/taskflow -f helm/taskflow/values-dev.yaml
kubectl apply --dry-run=client -f kubernetes/
```

Say:

The local demo does not need a real cloud cluster, but the manifests and Helm chart are ready for minikube or EKS.

## 22. Troubleshooting Guide

### Port 8080 Already In Use

Jenkins uses `8085` in this project because `8080` is commonly occupied.

Check ports:

```powershell
docker compose ps
```

Use:

```text
http://localhost:8085
```

### Jenkins Local Checkout Blocked

Error:

```text
ALLOW_LOCAL_CHECKOUT
```

Fix:

The Jenkins container is configured with:

```text
-Dhudson.plugins.git.GitSCM.ALLOW_LOCAL_CHECKOUT=true
```

and safe Git directories in `jenkins/Dockerfile`.

Rebuild:

```powershell
docker compose build jenkins
docker compose up -d --force-recreate jenkins
```

### Jenkins Says `docker: not found`

Fix:

The custom Jenkins image must include Docker CLI and mount the Docker socket.

Verify:

```powershell
docker exec taskflow-jenkins docker version
```

If it fails:

```powershell
docker compose build jenkins
docker compose up -d --force-recreate jenkins
```

### Docker Build Stage Fails Quickly

Open the failed Jenkins step and expand the console log. Common causes:

- Docker CLI missing
- Docker socket not mounted
- Docker Desktop not running
- Invalid Dockerfile path
- Network issue while pulling base image

Verify:

```powershell
docker version
docker exec taskflow-jenkins docker version
```

### SonarQube Shows Setup Page

This means the project exists but has not received a successful analysis yet. Run the Jenkins pipeline after the `sonarqube-token` credential is configured.

### Nexus Port 8082 Browser Error

This is expected. `8082` is the Docker registry connector, not the web UI. Use:

```text
http://localhost:8081
```

for UI, and:

```powershell
docker login localhost:8082
```

for Docker registry operations.

### Nexus Says Port Must Be Unique

The `taskflow-docker` repository already owns port `8082`. Do not create another Docker hosted repository on `8082`.

### Grafana Dashboard Looks Empty

Check Prometheus targets:

```text
http://localhost:9090/targets
```

Warm metrics:

```powershell
1..10 | ForEach-Object {
  Invoke-WebRequest -Uri "http://localhost:3000/api/metrics" -UseBasicParsing | Out-Null
  Invoke-WebRequest -Uri "http://localhost:3001/metrics" -UseBasicParsing | Out-Null
  Start-Sleep -Seconds 2
}
```

Restart:

```powershell
docker compose restart prometheus grafana
```

### Prisma Cannot Reach Database

Check Postgres:

```powershell
docker compose ps postgres
```

Push schema and seed:

```powershell
$env:DATABASE_URL='postgresql://taskflow:taskflow_local_password@localhost:5432/taskflow?schema=public'
$env:DIRECT_DATABASE_URL=$env:DATABASE_URL
npx prisma db push --schema prisma/schema.prisma
npm run db:seed
```

### App Shows Table Does Not Exist

Run database schema setup:

```powershell
$env:DATABASE_URL='postgresql://taskflow:taskflow_local_password@localhost:5432/taskflow?schema=public'
npx prisma db push --schema prisma/schema.prisma
npm run db:seed
docker compose restart frontend backend
```

## 23. Production Readiness Talking Points

Use these points when someone asks whether the project is really production-grade.

### Security

- Secrets are injected through credentials and Kubernetes secrets, not committed in code.
- Trivy scans images for CVEs.
- SonarQube checks code quality and security issues.
- Docker containers run as non-root users.
- Kubernetes network policies reduce lateral movement.
- IAM in AWS should use least privilege.

### Reliability

- Health checks exist for containers.
- Kubernetes readiness and liveness probes support self-healing.
- Rolling updates avoid downtime.
- Helm supports atomic upgrades and rollbacks.
- Jenkins has timeouts and cleanup.

### Scalability

- EKS node groups can autoscale.
- Kubernetes HPA can scale pods.
- Redis supports queue-backed async work.
- Frontend and backend are independently scalable.

### Observability

- Prometheus scrapes app metrics.
- Grafana visualizes technical and business KPIs.
- Alert rules detect downtime, latency, queue backlog, and auth failure spikes.

### Governance

- Git hooks enforce commit standards.
- PR template improves review consistency.
- Jenkins stage history gives delivery audit trails.
- Nexus gives artifact traceability.

## 24. Questions And Answers For Crowd

Q: What makes this more than a normal full-stack app?

A: The DevOps ecosystem. TaskFlow includes CI/CD, quality gates, image scanning, artifact registry, infrastructure as code, Kubernetes deployment manifests, Helm charts, monitoring, dashboards, and automation playbooks.

Q: Why split frontend and backend images?

A: They have different scaling, dependency, release, and failure profiles. Separate images make deployments more flexible.

Q: Why use both Docker Compose and Kubernetes?

A: Docker Compose is for local demo and development. Kubernetes is for production orchestration.

Q: Why use Nexus when Docker Hub exists?

A: Enterprises usually need private artifact control, retention policies, access control, and promotion workflows.

Q: What happens if tests fail?

A: Jenkins stops the pipeline and does not build, scan, push, or deploy unverified artifacts.

Q: What happens if Trivy finds critical vulnerabilities?

A: In this demo, the stage can mark the build unstable for presentation continuity. In production, critical vulnerabilities should fail the pipeline unless explicitly approved by security.

Q: Why is Kubernetes deploy gated?

A: Deployment should only happen from trusted branches and when real cluster credentials are present.

Q: How do you roll back?

A: Use Helm rollback or Kubernetes rollout undo:

```powershell
helm rollback taskflow 1 -n taskflow
kubectl rollout undo deployment/taskflow-frontend -n taskflow
```

Q: How do you know the app is healthy?

A: Health endpoints, Docker health checks, Kubernetes probes, Prometheus `up`, latency metrics, and Grafana dashboards.

Q: How would this scale for real users?

A: Deploy to EKS across multiple availability zones, use managed PostgreSQL/Neon, managed Redis/Upstash, HPA, node autoscaling, CDN in front of Next.js, and production ingress/load balancer.

Q: Why Terraform and Ansible both?

A: Terraform provisions infrastructure. Ansible configures machines. Terraform answers "what cloud resources exist"; Ansible answers "how servers are prepared."

Q: What is the difference between SonarQube and Trivy?

A: SonarQube analyzes source code quality and security. Trivy scans container images and dependencies for known vulnerabilities.

Q: What does Grafana show that Prometheus does not?

A: Prometheus stores and queries metrics. Grafana turns those metrics into dashboards that people can understand quickly.

## 25. Production Improvements To Mention Honestly

For a real production launch, you would add:

- Real DNS and TLS certificates
- Managed PostgreSQL and Redis
- Secret manager integration
- External ingress controller and WAF
- Centralized logs
- Backup and restore policy
- Disaster recovery runbooks
- Load testing
- SLOs and error budgets
- Multi-environment promotion workflow
- Production SonarQube version
- Separate staging and production Jenkins credentials

This honesty helps in a presentation because it shows engineering maturity.

## 26. Quick Command Cheat Sheet

```powershell
# Start everything
docker compose up -d

# Full guided setup
powershell -ExecutionPolicy Bypass -File .\scripts\setup-devops-demo.ps1 -SonarUser admin -SonarPassword "YOUR_SONAR_PASSWORD" -NexusUser admin -NexusPassword "YOUR_NEXUS_PASSWORD"

# Check services
docker compose ps

# Logs
docker compose logs --tail=120 jenkins
docker compose logs --tail=120 frontend
docker compose logs --tail=120 backend

# Rebuild Jenkins
docker compose build jenkins
docker compose up -d --force-recreate jenkins

# Verify Docker inside Jenkins
docker exec taskflow-jenkins docker version

# Database setup
$env:DATABASE_URL='postgresql://taskflow:taskflow_local_password@localhost:5432/taskflow?schema=public'
$env:DIRECT_DATABASE_URL=$env:DATABASE_URL
npx prisma db push --schema prisma/schema.prisma
npm run db:seed

# App health
Invoke-WebRequest http://localhost:3000/api/health -UseBasicParsing
Invoke-WebRequest http://localhost:3001/api/health -UseBasicParsing

# Prometheus targets
Start-Process "http://localhost:9090/targets"

# Grafana
Start-Process "http://localhost:3002/d/taskflow-enterprise/taskflow-enterprise-command-center"

# Helm validation
helm lint helm/taskflow
helm template taskflow helm/taskflow -f helm/taskflow/values-dev.yaml

# Kubernetes validation
kubectl apply --dry-run=client -f kubernetes/

# Terraform validation
cd terraform
terraform init
terraform validate
terraform plan
```

## 27. Final Presentation Closing

Close your presentation with this:

TaskFlow demonstrates the complete enterprise delivery lifecycle: source control discipline, automated CI/CD, quality gates, secure image builds, private artifact promotion, Kubernetes-ready deployment, metrics, dashboards, alerting, and infrastructure automation. It is built to show not only that the application works, but that the team understands how software is operated in production.

