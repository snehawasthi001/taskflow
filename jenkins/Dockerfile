# Jenkins controller used for live enterprise CI/CD demos.
# It includes only the allowed tools requested for this DevOps platform.
FROM jenkins/jenkins:lts-jdk17

USER root

ARG NODE_MAJOR=20
ARG KUBECTL_VERSION=v1.31.0
ARG HELM_VERSION=v3.16.0
ARG TRIVY_VERSION=0.56.2

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl gnupg lsb-release unzip tar docker.io \
  && curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash - \
  && apt-get install -y --no-install-recommends nodejs \
  && curl -fsSL "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl" -o /usr/local/bin/kubectl \
  && chmod +x /usr/local/bin/kubectl \
  && curl -fsSL "https://get.helm.sh/helm-${HELM_VERSION}-linux-amd64.tar.gz" | tar -xz -C /tmp \
  && mv /tmp/linux-amd64/helm /usr/local/bin/helm \
  && curl -fsSL "https://github.com/aquasecurity/trivy/releases/download/v${TRIVY_VERSION}/trivy_${TRIVY_VERSION}_Linux-64bit.deb" -o /tmp/trivy.deb \
  && dpkg -i /tmp/trivy.deb \
  && curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip \
  && unzip -q /tmp/awscliv2.zip -d /tmp \
  && /tmp/aws/install \
  && usermod -aG docker jenkins \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/* /tmp/*

USER jenkins
