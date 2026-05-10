import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import prisma from "../../lib/prisma";

export function requireRole(roles: string[]) {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        return next({ status: 401, message: "Authentication required" });
      }

      const member = await prisma.workspaceMember.findFirst({
        where: { userId: req.userId },
        select: { role: true },
      });

      if (!member || !roles.includes(member.role)) {
        return next({ status: 403, message: "Insufficient permissions" });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
