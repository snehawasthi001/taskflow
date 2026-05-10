import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import redis from "@/lib/redis";

export async function GET() {
  const checks: Record<string, string> = {};
  let healthy = true;

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = "ok";
  } catch {
    checks.database = "error";
    healthy = false;
  }

  // Redis check
  try {
    await redis.ping();
    checks.redis = "ok";
  } catch {
    checks.redis = "error";
    healthy = false;
  }

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    },
    { status: healthy ? 200 : 503 }
  );
}
