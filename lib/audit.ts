import { prisma } from "@/lib/prisma"

interface AuditLogParams {
  actorId: string
  action: string
  entityType: string
  entityId: string
  prevState?: string
  newState?: string
  metadata?: any
}

export async function createAuditLog(params: AuditLogParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        prevState: params.prevState,
        newState: params.newState,
        metadata: params.metadata || {},
      }
    })
  } catch (error) {
    console.error("Failed to create audit log:", error)
  }
}
