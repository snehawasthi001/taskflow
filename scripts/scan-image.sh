#!/usr/bin/env sh
set -eu

IMAGE="${1:?Usage: scripts/scan-image.sh <image> <report-name>}"
REPORT_NAME="${2:-image}"
REPORT_DIR="${TRIVY_REPORT_DIR:-trivy-reports}"
SEVERITY="${TRIVY_SEVERITY:-HIGH,CRITICAL}"
SCANNERS="${TRIVY_SCANNERS:-vuln}"

mkdir -p "$REPORT_DIR"

# JSON is machine-readable for audit retention; HTML is presentation-friendly.
trivy image \
  --scanners "$SCANNERS" \
  --severity "$SEVERITY" \
  --format json \
  --output "$REPORT_DIR/$REPORT_NAME.json" \
  "$IMAGE"

if [ -f /usr/local/share/trivy/templates/html.tpl ]; then
  trivy image \
    --scanners "$SCANNERS" \
    --severity "$SEVERITY" \
    --format template \
    --template '@/usr/local/share/trivy/templates/html.tpl' \
    --output "$REPORT_DIR/$REPORT_NAME.html" \
    "$IMAGE"
else
  trivy image --scanners "$SCANNERS" --severity "$SEVERITY" --format table "$IMAGE" > "$REPORT_DIR/$REPORT_NAME.txt"
  {
    printf '<!doctype html><html><head><meta charset="utf-8"><title>Trivy %s</title>' "$REPORT_NAME"
    printf '<style>body{background:#0f1117;color:#e6edf3;font-family:Inter,Arial,sans-serif;padding:32px}pre{white-space:pre-wrap;background:#161b22;border:1px solid #30363d;border-radius:12px;padding:24px}</style></head><body>'
    printf '<h1>Trivy scan: %s</h1><pre>' "$IMAGE"
    sed 's/&/\&amp;/g; s/</\&lt;/g; s/>/\&gt;/g' "$REPORT_DIR/$REPORT_NAME.txt"
    printf '</pre></body></html>'
  } > "$REPORT_DIR/$REPORT_NAME.html"
fi

# Fail the pipeline on HIGH or CRITICAL vulnerabilities.
trivy image \
  --scanners "$SCANNERS" \
  --severity "$SEVERITY" \
  --exit-code 1 \
  --ignore-unfixed \
  "$IMAGE"
