/**
 * Drizzle query helpers - common query patterns converted from Prisma syntax
 */
import { eq, and, gt, count } from "drizzle-orm";
import { db, schema } from "./db.js";

export const userQueries = {
  update: async (userId: string, data: Partial<typeof schema.user.$inferInsert>) => {
    await db
      .update(schema.user)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.user.id, userId));
  },
  findUnique: async (userId: string) => {
    const [user] = await db.select().from(schema.user).where(eq(schema.user.id, userId));
    return user || null;
  }
};

export const invitationQueries = {
  findFirst: async (conditions: { email?: string; status?: string; expiresAt?: { gt?: Date } }) => {
    const conditionsArray = [];
    if (conditions.email) {
      conditionsArray.push(eq(schema.invitation.email, conditions.email));
    }
    if (conditions.status) {
      conditionsArray.push(eq(schema.invitation.status, conditions.status));
    }
    if (conditions.expiresAt?.gt) {
      conditionsArray.push(gt(schema.invitation.expiresAt, conditions.expiresAt.gt));
    }

    const [invitation] = await db
      .select()
      .from(schema.invitation)
      .where(and(...conditionsArray))
      .limit(1);

    if (!invitation) return null;

    // Get household
    const [household] = await db
      .select()
      .from(schema.household)
      .where(eq(schema.household.id, invitation.organizationId))
      .limit(1);

    return { ...invitation, household: household || null };
  },

  update: async (invitationId: string, data: Partial<typeof schema.invitation.$inferInsert>) => {
    await db
      .update(schema.invitation)
      .set({ ...data })
      .where(eq(schema.invitation.id, invitationId));
  }
};

export const userHouseholdQueries = {
  findUnique: async (userId: string, householdId: string) => {
    const [membership] = await db
      .select()
      .from(schema.userHousehold)
      .where(
        and(
          eq(schema.userHousehold.userId, userId),
          eq(schema.userHousehold.householdId, householdId)
        )
      )
      .limit(1);
    return membership || null;
  },

  create: async (data: typeof schema.userHousehold.$inferInsert) => {
    const [membership] = await db.insert(schema.userHousehold).values(data).returning();
    return membership;
  }
};

export const deviceQueries = {
  count: async (conditions: { householdId?: string; isActive?: boolean }) => {
    const conditionsArray = [];
    if (conditions.householdId) {
      conditionsArray.push(eq(schema.device.householdId, conditions.householdId));
    }
    if (conditions.isActive !== undefined) {
      conditionsArray.push(eq(schema.device.isActive, conditions.isActive));
    }

    const result = await db
      .select({ count: count() })
      .from(schema.device)
      .where(conditionsArray.length > 0 ? and(...conditionsArray) : undefined);

    return result[0]?.count || 0;
  }
};
