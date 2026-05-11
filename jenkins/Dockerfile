# Jenkins controller used for live enterprise CI/CD demos.
# It includes only the allowed tools requested for this DevOps platform.
FROM jenkins/jenkins:lts-jdk17

USER root

ARG NODE_MAJOR=20
ARG KUBECTL_VERSION=v1.31.0
ARG HELM_VERSION=v3.16.0
ARG SONAR_SCANNER_VERSION=6.2.1.4610

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git gnupg lsb-release unzip tar docker.io \
  && curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && curl -fsSL "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl" -o /usr/local/bin/kubectl \
  && chmod +x /usr/local/bin/kubectl \
  && curl -fsSL "https://get.helm.sh/helm-${HELM_VERSION}-linux-amd64.tar.gz" | tar -xz -C /tmp \
  && mv /tmp/linux-amd64/helm /usr/local/bin/helm \
  && curl -fsSL https://aquasecurity.github.io/trivy-repo/deb/public.key | gpg --dearmor -o /usr/share/keyrings/trivy.gpg \
  && echo "deb [signed-by=/usr/share/keyrings/trivy.gpg] https://aquasecurity.github.io/trivy-repo/deb generic main" > /etc/apt/sources.list.d/trivy.list \
  && apt-get update \
  && apt-get install -y --no-install-recommends trivy \
  && curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip \
  && unzip -q /tmp/awscliv2.zip -d /tmp \
  && /tmp/aws/install \
  && curl -fsSL "https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-${SONAR_SCANNER_VERSION}-linux-x64.zip" -o /tmp/sonar-scanner.zip \
  && unzip -q /tmp/sonar-scanner.zip -d /opt \
  && ln -s "/opt/sonar-scanner-${SONAR_SCANNER_VERSION}-linux-x64/bin/sonar-scanner" /usr/local/bin/sonar-scanner \
  && git config --system --add safe.directory /workspace/taskflow \
  && git config --system --add safe.directory /workspace/taskflow/.git \
  && usermod -aG docker jenkins \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/*

USER jenkins
