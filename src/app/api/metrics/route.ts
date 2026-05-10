import { NextResponse } from "next/server";

// Prometheus-compatible metrics endpoint
// In production, this would integrate with prom-client
const startTime = Date.now();

export async function GET() {
  const uptime = (Date.now() - startTime) / 1000;

  const metrics = [
    "# HELP taskflow_http_requests_total Total HTTP requests",
    "# TYPE taskflow_http_requests_total counter",
    "taskflow_http_requests_total{method=\"GET\",path=\"/api/health\",status=\"200\"} 1",
    "",
    "# HELP taskflow_uptime_seconds Application uptime in seconds",
    "# TYPE taskflow_uptime_seconds gauge",
    `taskflow_uptime_seconds ${uptime.toFixed(2)}`,
    "",
    "# HELP taskflow_tasks_total Total tasks in the system",
    "# TYPE taskflow_tasks_total gauge",
    "taskflow_tasks_total{status=\"BACKLOG\"} 0",
    "taskflow_tasks_total{status=\"TODO\"} 0",
    "taskflow_tasks_total{status=\"IN_PROGRESS\"} 0",
    "taskflow_tasks_total{status=\"DONE\"} 0",
    "",
  ].join("\n");

  return new NextResponse(metrics, {
    headers: { "Content-Type": "text/plain; version=0.0.4; charset=utf-8" },
  });
}
