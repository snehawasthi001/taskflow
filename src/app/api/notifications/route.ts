import { NextResponse } from "next/server";
import { getRequestContext } from "@/lib/app-data";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { user } = await getRequestContext();
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      notifications,
      unreadCount: notifications.filter((notification) => !notification.isRead).length,
    });
  } catch (error) {
    console.error("[Notifications GET]", error);
    return NextResponse.json({ error: "Failed to load notifications" }, { status: 500 });
  }
}

export async function PATCH() {
  try {
    const { user } = await getRequestContext();
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Notifications PATCH]", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
