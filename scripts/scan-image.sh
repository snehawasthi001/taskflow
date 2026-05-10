#!/usr/bin/env sh
set -eu

IMAGE="${1:?Usage: scripts/scan-image.sh <image> <report-name>}"
REPORT_NAME="${2:-image}"
REPORT_DIR="${TRIVY_REPORT_DIR:-trivy-reports}"
SEVERITY="${TRIVY_SEVERITY:-HIGH,CRITICAL}"

mkdir -p "$REPORT_DIR"

# JSON is machine-readable for audit retention; HTML is presentation-friendly.
trivy image \
  --severity "$SEVERITY" \
  --format json \
  --output "$REPORT_DIR/$REPORT_NAME.json" \
  "$IMAGE"

trivy image \
  --severity "$SEVERITY" \
  --format template \
  --template '@/usr/local/share/trivy/templates/html.tpl' \
  --output "$REPORT_DIR/$REPORT_NAME.html" \
  "$IMAGE"

# Fail the pipeline on HIGH or CRITICAL vulnerabilities.
trivy image \
  --severity "$SEVERITY" \
  --exit-code 1 \
  --ignore-unfixed \
  "$IMAGE"
