import com.cloudbees.plugins.credentials.Credentials
import com.cloudbees.plugins.credentials.CredentialsProvider
import com.cloudbees.plugins.credentials.CredentialsScope
import com.cloudbees.plugins.credentials.SystemCredentialsProvider
import com.cloudbees.plugins.credentials.domains.Domain
import com.cloudbees.plugins.credentials.impl.UsernamePasswordCredentialsImpl
import hudson.plugins.git.BranchSpec
import hudson.plugins.git.GitSCM
import hudson.plugins.git.UserRemoteConfig
import hudson.util.Secret
import jenkins.model.Jenkins
import org.jenkinsci.plugins.plaincredentials.impl.StringCredentialsImpl
import org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition
import org.jenkinsci.plugins.workflow.job.WorkflowJob

def jenkins = Jenkins.get()
def globalDomain = Domain.global()
def credentialsStore = SystemCredentialsProvider.getInstance().getStore()

def upsertCredential = { Credentials credential ->
  def existing = CredentialsProvider.lookupCredentials(Credentials.class, jenkins, null, null)
    .find { it.id == credential.id }

  if (existing) {
    credentialsStore.updateCredentials(globalDomain, existing, credential)
  } else {
    credentialsStore.addCredentials(globalDomain, credential)
  }
}

def readSecret = { String path, String fallback ->
  def file = new File(path)
  file.exists() ? file.text.trim() : fallback
}

def nexusPassword = readSecret('/var/jenkins_home/taskflow-secrets/nexus-password', 'admin')
upsertCredential(new UsernamePasswordCredentialsImpl(
  CredentialsScope.GLOBAL,
  'nexus-docker-registry',
  'TaskFlow local Nexus Docker registry credentials',
  'admin',
  nexusPassword
))

def sonarToken = readSecret('/var/jenkins_home/taskflow-secrets/sonarqube-token', 'demo-token-not-configured')
upsertCredential(new StringCredentialsImpl(
  CredentialsScope.GLOBAL,
  'sonarqube-token',
  'TaskFlow SonarQube analysis token',
  Secret.fromString(sonarToken)
))

def repoPath = '/workspace/taskflow'
def jobName = 'taskflow-enterprise-pipeline'
def job = jenkins.getItem(jobName) ?: jenkins.createProject(WorkflowJob, jobName)

def scm = new GitSCM(
  [new UserRemoteConfig("file://${repoPath}", null, null, null)],
  [new BranchSpec('*/master')],
  false,
  [],
  null,
  null,
  []
)

def definition = new CpsScmFlowDefinition(scm, 'jenkins/Jenkinsfile')
definition.setLightweight(false)

job.setDefinition(definition)
job.setDescription('Enterprise CI/CD demo: tests, lint, SonarQube analysis, Docker build, Trivy scan, Nexus push, and Helm deployment gate.')
job.save()

if (job.getBuilds().isEmpty()) {
  job.scheduleBuild2(10)
}

jenkins.save()
println "TaskFlow Jenkins provisioning complete: ${jobName}"
