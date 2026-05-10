const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

describe("TaskFlow DevOps platform smoke checks", () => {
  test("ships the CI/CD entrypoints used in the university demo", () => {
    const requiredFiles = [
      "docker-compose.yml",
      "jenkins/Jenkinsfile",
      "sonar-project.properties",
      "prometheus/prometheus.yml",
      "grafana/dashboards/taskflow-dashboard.json",
      "helm/taskflow/Chart.yaml",
      "terraform/main.tf",
      "ansible/setup-node.yml",
    ];

    for (const file of requiredFiles) {
      expect(fs.existsSync(path.join(root, file))).toBe(true);
    }
  });
});
