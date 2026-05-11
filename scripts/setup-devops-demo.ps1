param(
  [string]$SonarUser = "admin",
  [string]$SonarPassword = "admin",
  [string]$NexusUser = "admin",
  [string]$NexusPassword = "",
  [string]$NexusRepository = "taskflow-docker"
)

$ErrorActionPreference = "Stop"

function Wait-HttpOk {
  param(
    [string]$Url,
    [int]$Retries = 60,
    [int]$DelaySeconds = 5
  )

  for ($i = 1; $i -le $Retries; $i++) {
    try {
      $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
      if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
        return
      }
    } catch {
      Start-Sleep -Seconds $DelaySeconds
    }
  }

  throw "Timed out waiting for $Url"
}

function Invoke-NexusApi {
  param(
    [string]$Method,
    [string]$Path,
    [object]$Body = $null
  )

  $password = if ($NexusPassword) {
    $NexusPassword
  } else {
    docker exec taskflow-nexus sh -lc "cat /nexus-data/admin.password 2>/dev/null || echo admin"
  }
  $password = $password.Trim()
  $pair = "${NexusUser}:$password"
  $encoded = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
  $headers = @{ Authorization = "Basic $encoded" }
  $uri = "http://localhost:8081$Path"

  if ($null -eq $Body) {
    return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers -TimeoutSec 30
  }

  return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 10) -TimeoutSec 30
}

function Ensure-NexusDockerRegistry {
  Wait-HttpOk "http://localhost:8081"

  try {
    $repositories = Invoke-NexusApi -Method Get -Path "/service/rest/v1/repositories"
    if (-not ($repositories | Where-Object { $_.name -eq $NexusRepository })) {
      $body = @{
        name = $NexusRepository
        online = $true
        storage = @{
          blobStoreName = "default"
          strictContentTypeValidation = $true
          writePolicy = "allow"
        }
        cleanup = @{ policyNames = @() }
        component = @{ proprietaryComponents = $false }
        docker = @{
          v1Enabled = $false
          forceBasicAuth = $true
          httpPort = 8082
        }
      }
      Invoke-NexusApi -Method Post -Path "/service/rest/v1/repositories/docker/hosted" -Body $body | Out-Null
      Write-Host "Created Nexus Docker repository: $NexusRepository on localhost:8082"
    } else {
      Write-Host "Nexus Docker repository already exists: $NexusRepository"
    }

    $realms = Invoke-NexusApi -Method Get -Path "/service/rest/v1/security/realms/active"
    if ($realms -notcontains "DockerToken") {
      Invoke-NexusApi -Method Put -Path "/service/rest/v1/security/realms/active" -Body @($realms + "DockerToken") | Out-Null
      Write-Host "Enabled Nexus Docker token realm"
    }
  } catch {
    Write-Warning "Nexus repository automation could not finish. Open http://localhost:8081 and create Docker hosted repo '$NexusRepository' on port 8082 if needed."
    Write-Warning $_.Exception.Message
  }
}

function Try-CreateSonarToken {
  param(
    [string]$User,
    [string]$Password
  )

  Wait-HttpOk "http://localhost:9000"

  try {
    $pair = "${User}:${Password}"
    $encoded = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
    $headers = @{ Authorization = "Basic $encoded" }
    $tokenName = "taskflow-jenkins-{0}" -f (Get-Date -Format "yyyyMMddHHmmss")
    $response = Invoke-RestMethod -Method Post -Uri "http://localhost:9000/api/user_tokens/generate" -Headers $headers -ContentType "application/x-www-form-urlencoded" -Body "name=$tokenName" -TimeoutSec 30
    if ($response.token) {
      return $response.token
    }
  } catch {
    Write-Warning "Could not auto-create a SonarQube token. The pipeline will mark Sonar as UNSTABLE until you add a real token."
  }

  return "demo-token-not-configured"
}

function Write-JenkinsSecret {
  param(
    [string]$Name,
    [string]$Value
  )

  docker exec taskflow-jenkins sh -lc "mkdir -p /var/jenkins_home/taskflow-secrets"
  $Value | docker exec -i taskflow-jenkins sh -lc "cat > /var/jenkins_home/taskflow-secrets/$Name"
}

docker version | Out-Null

Write-Host "Building TaskFlow demo images..."
docker compose build frontend backend jenkins

Write-Host "Starting the DevOps platform..."
docker compose up -d

Wait-HttpOk "http://localhost:3000/api/health"
Wait-HttpOk "http://localhost:3001/api/health"

Write-Host "Preparing the local PostgreSQL schema and demo data..."
$previousDatabaseUrl = $env:DATABASE_URL
$previousDirectDatabaseUrl = $env:DIRECT_DATABASE_URL
$env:DATABASE_URL = "postgresql://taskflow:taskflow_local_password@localhost:5432/taskflow?schema=public"
$env:DIRECT_DATABASE_URL = $env:DATABASE_URL
npx prisma db push --schema prisma/schema.prisma
npm run db:seed
$env:DATABASE_URL = $previousDatabaseUrl
$env:DIRECT_DATABASE_URL = $previousDirectDatabaseUrl

Ensure-NexusDockerRegistry

$nexusPassword = if ($NexusPassword) {
  $NexusPassword
} else {
  docker exec taskflow-nexus sh -lc "cat /nexus-data/admin.password 2>/dev/null || echo admin"
}
$sonarToken = Try-CreateSonarToken -User $SonarUser -Password $SonarPassword

Write-Host "Injecting Jenkins demo credentials..."
Write-JenkinsSecret -Name "nexus-password" -Value $nexusPassword.Trim()
Write-JenkinsSecret -Name "sonarqube-token" -Value $sonarToken

Write-Host "Recreating Jenkins so init.groovy provisions the pipeline job..."
docker compose up -d --force-recreate jenkins

Write-Host "Restarting Grafana and Prometheus so the updated dashboard is provisioned..."
docker compose restart prometheus grafana

Write-Host "Warming API metrics for Grafana..."
1..5 | ForEach-Object {
  Invoke-WebRequest -Uri "http://localhost:3000/api/metrics" -UseBasicParsing | Out-Null
  Invoke-WebRequest -Uri "http://localhost:3001/metrics" -UseBasicParsing | Out-Null
  Invoke-WebRequest -Uri "http://localhost:3000/api/tasks" -UseBasicParsing | Out-Null
  Invoke-WebRequest -Uri "http://localhost:3000/api/projects" -UseBasicParsing | Out-Null
  Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "TaskFlow DevOps demo is ready."
Write-Host "App:        http://localhost:3000"
Write-Host "Backend:    http://localhost:3001/api/health"
Write-Host "Jenkins:    http://localhost:8085/job/taskflow-enterprise-pipeline/"
Write-Host "Grafana:    http://localhost:3002/d/taskflow-enterprise/taskflow-enterprise-command-center  (admin / taskflow)"
Write-Host "Prometheus: http://localhost:9090/targets"
Write-Host "SonarQube:  http://localhost:9000"
Write-Host "Nexus:      http://localhost:8081"
