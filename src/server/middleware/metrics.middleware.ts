import { Request, Response, NextFunction } from "express";
import client from "prom-client";

export const metricsRegister = new client.Registry();

client.collectDefaultMetrics({
  register: metricsRegister,
  prefix: "taskflow_backend_",
});

const httpRequestsTotal = new client.Counter({
  name: "taskflow_backend_http_requests_total",
  help: "Total HTTP requests served by the Express API.",
  labelNames: ["method", "route", "status_code"],
  registers: [metricsRegister],
});

const httpRequestDuration = new client.Histogram({
  name: "taskflow_backend_http_request_duration_seconds",
  help: "HTTP request duration for the Express API.",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [metricsRegister],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const endTimer = httpRequestDuration.startTimer();

  res.on("finish", () => {
    const route = req.route?.path ?? req.path;
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    endTimer(labels);

    if (process.env.NODE_ENV === "development") {
      const duration = Number(res.getHeader("X-Response-Time") ?? 0);
      console.log(`[Metrics] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    }
  });

  next();
}

export async function metricsHandler(_req: Request, res: Response) {
  res.setHeader("Content-Type", metricsRegister.contentType);
  res.send(await metricsRegister.metrics());
}
