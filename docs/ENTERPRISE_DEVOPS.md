# TaskFlow Enterprise DevOps Platform

This runbook documents the productionization layer for TaskFlow. It keeps the existing application intact and adds an enterprise DevOps ecosystem around it:

Developer push -> Jenkins -> Test and lint -> SonarQube -> Docker build -> Trivy scan -> Nexus push -> Helm deploy -> Kubernetes rolling update -> Prometheus -> Grafana.

## What You Need To Provide For Real Production

- AWS credentials with permission to create VPC, EKS, ECR, IAM, S3, DynamoDB, and CloudWatch resources.
- A unique Terraform state bucket name if `taskflow-terraform-state` is already taken.
- Nexus admin password and a Docker hosted registry on port `8082`.
- Jenkins credentials:
  - `nexus-docker-registry`: username/password for Nexus Docker registry.
  - `taskflow-kubeconfig`: kubeconfig file credential for the target cluster.
  - SonarQube server named `SonarQube`.
- Production secrets: `DATABASE_URL`, `REDIS_URL`, `NEXTAUTH_SECRET`, `JWT_SECRET`, `NEXTAUTH_URL`.
- DNS name and TLS secret for the production ingress.

## Local Demo

```bash
docker compose up --build
```

Services:

- TaskFlow frontend: `http://localhost:3000`
- TaskFlow backend: `http://localhost:3001`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3002`
- Jenkins: `http://localhost:8085`
- SonarQube: `http://localhost:9000`
- Nexus: `http://localhost:8081`

## AWS Bootstrap And Provisioning

```bash
cd terraform/bootstrap
terraform init
terraform apply

cd ..
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

## Kubernetes And Helm

Raw manifests:

```bash
kubectl apply -f kubernetes/
```

Helm dev:

```bash
helm upgrade --install taskflow helm/taskflow -n taskflow --create-namespace -f helm/taskflow/values-dev.yaml
```

Helm prod:

```bash
helm upgrade --install taskflow helm/taskflow -n taskflow --create-namespace -f helm/taskflow/values-prod.yaml --atomic --timeout 8m
```

## File Inventory

| File | Why it exists | How it works | Integration | Enterprise practice |
| --- | --- | --- | --- | --- |
| `.husky/pre-commit` | Blocks low-quality commits before they enter Git history. | Runs `lint-staged` against staged TypeScript files. | Uses package `lint-staged` and ESLint. | Shift-left validation. |
| `.husky/commit-msg` | Enforces Conventional Commits. | Runs commitlint against the commit message. | Uses `commitlint.config.js`. | Release automation readiness and readable history. |
| `commitlint.config.js` | Defines allowed commit types. | Extends conventional config and allows common enterprise types. | Used by Husky commit hook. | Standardized Git workflow. |
| `.github/PULL_REQUEST_TEMPLATE.md` | Provides PR review structure. | Prompts for tests, rollout risk, screenshots, and deployment notes. | Used by repository hosting UI. | Change management discipline. |
| `.dockerignore` | Keeps Docker contexts small and secret-free. | Excludes build output, dependencies, logs, state, and env files. | Used by both Dockerfiles. | Faster, safer image builds. |
| `docker/Dockerfile.frontend` | Builds the Next.js frontend image. | Multi-stage build, Prisma generation, standalone Next output, non-root runtime, healthcheck. | Used by Docker Compose and Jenkins. | Least privilege and optimized layers. |
| `docker/Dockerfile.backend` | Builds the Express backend image. | Multi-stage TypeScript compile, non-root runtime, healthcheck. | Used by Docker Compose and Jenkins. | Runtime minimization and health-aware deployment. |
| `docker-compose.yml` | Runs the full local DevOps stack. | Starts app, Postgres, Redis, Prometheus, Grafana, Jenkins, SonarQube, Nexus. | Local demo and platform validation. | Reproducible demo environment. |
| `jenkins/Dockerfile` | Creates the Jenkins controller image. | Adds Docker CLI, kubectl, Helm, Trivy, AWS CLI, and Node 20. | Used by Docker Compose Jenkins service. | Toolchain consistency. |
| `jenkins/Jenkinsfile` | Main CI/CD orchestration. | Declarative pipeline with parallel tests, linting, SonarQube, Docker, Trivy, Nexus, Helm. | Jenkins multibranch job should point here. | Branch-gated deploys, credentials, retention, cleanup. |
| `sonar-project.properties` | Configures SonarQube analysis. | Defines sources, exclusions, coverage report, and quality gate wait. | Used in Jenkins Sonar stage. | Code quality gate before release. |
| `scripts/scan-image.sh` | Standardizes Trivy scans. | Produces JSON and HTML reports and fails on high/critical CVEs. | Used in Jenkins Trivy stage. | Security gate before artifact push. |
| `nexus/docker-hosted-repository.json` | Documents the private Docker registry config. | Can be posted to the Nexus REST API after admin setup. | Jenkins pushes images to this registry on port `8082`. | Private artifact control and immutable write policy. |
| `terraform/bootstrap/main.tf` | Creates remote state resources. | Provisions encrypted S3 state bucket and DynamoDB lock table. | Run once before main Terraform. | Safe shared state and locking. |
| `terraform/backend.tf` | Configures provider and remote backend. | Uses S3 backend with DynamoDB locking and default AWS tags. | Used by all Terraform modules. | Auditable, locked IaC state. |
| `terraform/main.tf` | Wires infrastructure modules together. | Calls VPC, ECR, and EKS modules. | Outputs feed Jenkins/Kubernetes setup. | Modular reusable IaC. |
| `terraform/variables.tf` | Centralizes input configuration. | Defines project, environment, VPC, EKS size, and version variables. | Used by Terraform plan/apply. | Environment portability. |
| `terraform/outputs.tf` | Exposes infrastructure outputs. | Prints cluster, subnet, ECR, and CloudWatch values. | Used for deployment setup and demos. | Operational transparency. |
| `terraform/terraform.tfvars.example` | Provides safe Terraform sample values. | Shows cost-conscious production defaults. | Copy to `terraform.tfvars`. | Repeatable environment creation. |
| `terraform/modules/vpc/main.tf` | Builds the network foundation. | Creates DNS-enabled VPC, public/private subnets, IGW, NAT, routes. | EKS consumes private subnets. | Multi-AZ networking and private workloads. |
| `terraform/modules/ecr/main.tf` | Creates AWS image repositories. | Builds frontend/backend ECR repos with scanning and lifecycle policy. | Optional AWS image registry alternative to Nexus. | Image retention and scan-on-push. |
| `terraform/modules/eks/main.tf` | Builds Kubernetes compute. | Creates EKS, IAM roles, managed node group, CloudWatch logs. | Helm deploys TaskFlow here. | Managed control plane and autoscaling nodes. |
| `kubernetes/namespace.yaml` | Creates isolated runtime namespace. | Adds pod security labels. | Applied before app resources. | Namespace and pod security boundaries. |
| `kubernetes/configmap.yaml` | Stores non-secret runtime config. | Provides ports, URLs, metrics path, log level. | Referenced by Deployments. | Config externalization. |
| `kubernetes/secret.yaml` | Stores sensitive placeholders. | Uses `stringData` for deployment-time secret injection. | Referenced by Deployments. | Secrets separated from images. |
| `kubernetes/deployment.yaml` | Runs frontend and backend pods. | Rolling updates, probes, resources, non-root security, Prometheus annotations. | Services, HPA, and Ingress target these pods. | Zero-downtime deployment defaults. |
| `kubernetes/service.yaml` | Provides stable service discovery. | Exposes frontend and backend as ClusterIP services. | Ingress routes to services. | Internal-only service exposure. |
| `kubernetes/ingress.yaml` | Provides public routing. | Routes `/`, `/api`, and `/socket.io` with TLS-ready config. | External users reach app through ingress. | Centralized edge routing. |
| `kubernetes/hpa.yaml` | Adds autoscaling. | Scales frontend/backend on CPU and memory. | Requires metrics-server in the cluster. | Elastic capacity management. |
| `kubernetes/network-policy.yaml` | Adds network isolation. | Default-deny plus explicit app/external egress rules. | Enforced by compatible CNI. | Least-privilege networking. |
| `helm/taskflow/Chart.yaml` | Declares the Helm package. | Sets chart metadata and app version. | Used by Jenkins Helm deploy stage. | Versioned release artifact. |
| `helm/taskflow/values.yaml` | Base Helm configuration. | Defines images, services, ingress, config, secrets, resources, HPA. | Overridden by dev/staging/prod values. | Environment-neutral defaults. |
| `helm/taskflow/values-dev.yaml` | Dev/minikube values. | Uses one replica and low resources. | Local Helm demo. | Cost-conscious development. |
| `helm/taskflow/values-staging.yaml` | Staging values. | Uses moderate scale and staging host. | Pre-production deploys. | Release validation environment. |
| `helm/taskflow/values-prod.yaml` | Production values. | Uses TLS, larger replicas, stronger autoscaling. | Jenkins production deploy. | Production safety defaults. |
| `helm/taskflow/templates/*` | Reusable Kubernetes templates. | Renders namespace, config, secrets, deployments, services, ingress, HPA, network policies. | Jenkins passes image tags into Helm. | DRY deployment definitions. |
| `prometheus/prometheus.yml` | Local Prometheus config. | Scrapes frontend/backend metrics in Docker Compose. | Powers Grafana locally. | Observable local demo. |
| `prometheus/prometheus-kubernetes.yml` | In-cluster Prometheus config. | Uses Kubernetes service discovery and pod annotations. | Use when running Prometheus in EKS/minikube. | Dynamic target discovery. |
| `prometheus/rules/taskflow-alerts.yml` | Alerting rules. | Detects downtime, latency, errors, auth spikes, queue backlog, WebSocket drops, overdue tasks. | Loaded by Prometheus. | SLO-oriented alerting. |
| `grafana/provisioning/datasources/prometheus.yml` | Auto-adds Prometheus datasource. | Creates non-editable default datasource. | Grafana starts ready for dashboards. | No manual dashboard setup. |
| `grafana/provisioning/dashboards/dashboards.yml` | Auto-loads dashboards. | Watches dashboard JSON folder. | Used by Grafana container. | Repeatable observability provisioning. |
| `grafana/dashboards/taskflow-dashboard.json` | Presentation dashboard. | 15 panels for availability, latency, errors, queue, WebSocket, business KPIs, Kubernetes health, alerts. | Uses Prometheus datasource. | Executive and engineering visibility. |
| `ansible/ansible.cfg` | Ansible defaults. | Sets inventory, pipelining, and callback behavior. | Used by setup playbook. | Predictable automation settings. |
| `ansible/inventory/hosts.ini` | Host inventory template. | Provides a place for EC2 worker or demo hosts. | Used by Ansible commands. | Repeatable server targeting. |
| `ansible/setup-node.yml` | Idempotent node bootstrap. | Installs Docker, kubectl, Helm, AWS CLI, firewall rules, and utilities. | Prepares demo/ops hosts. | Configuration management as code. |
| `ansible/playbooks/setup-node.yml` | Backward-compatible playbook path. | Imports the root setup playbook. | Supports both requested and existing paths. | Non-breaking migration. |
| `.env.example` | Environment variable template. | Provides local-safe placeholders for app and DevOps services. | Used by Docker Compose. | No secrets committed. |
| `package.json` | Connects Git hooks to local validation. | Keeps `lint-staged` focused on ESLint staged checks. | Used by Husky pre-commit. | Fast developer feedback. |
| `tsconfig.server.json` | Builds only the Express server. | Emits `src/server` TypeScript into `dist`. | Used by backend Dockerfile and Jenkins builds. | Separate frontend/backend build boundaries. |
| `README.md` | Entry point for developers and reviewers. | Points to local app and DevOps stack commands. | Links to this runbook. | Fast onboarding for demos. |
| `docs/ENTERPRISE_DEVOPS.md` | Complete platform runbook. | Explains architecture, commands, files, integrations, and required secrets. | Supports live presentation and handoff. | Operable documentation. |

## Branch Protection Recommendations

- Protect `main`.
- Require Jenkins build success before merge.
- Require SonarQube quality gate pass.
- Require at least one approval.
- Require Conventional Commits.
- Prevent force pushes and branch deletion.

## Nexus Tagging Strategy

- `1.0.0-<git-sha>`: immutable release build.
- `<git-sha>`: commit traceability.
- `latest`: only from `main`.

## Rollback

```bash
helm history taskflow -n taskflow
helm rollback taskflow <revision> -n taskflow
kubectl rollout status deployment/taskflow-frontend -n taskflow
kubectl rollout status deployment/taskflow-backend -n taskflow
```
