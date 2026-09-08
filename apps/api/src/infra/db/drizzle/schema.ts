import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const membershipRole = pgEnum("membership_role", ["admin", "respondente", "visualizador"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)]
);

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const organizationMemberships = pgTable(
  "organization_memberships",
  {
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    role: membershipRole("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [
    primaryKey({ columns: [table.organizationId, table.userId] }),
    index("organization_memberships_user_idx").on(table.userId)
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    activeOrganizationId: uuid("active_organization_id").references(() => organizations.id),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index("sessions_user_idx").on(table.userId), index("sessions_expiry_idx").on(table.expiresAt)]
);

export const commandReceipts = pgTable(
  "command_receipts",
  {
    actorId: uuid("actor_id")
      .notNull()
      .references(() => users.id),
    commandType: text("command_type").notNull(),
    commandId: text("command_id").notNull(),
    requestHash: text("request_hash").notNull(),
    result: jsonb("result").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [primaryKey({ columns: [table.actorId, table.commandType, table.commandId] })]
);

export const outbox = pgTable(
  "outbox",
  {
    id: uuid("id").primaryKey(),
    eventType: text("event_type").notNull(),
    aggregateType: text("aggregate_type").notNull(),
    aggregateId: uuid("aggregate_id").notNull(),
    organizationId: uuid("organization_id").notNull(),
    actorId: uuid("actor_id").notNull(),
    correlationId: uuid("correlation_id").notNull(),
    causationId: text("causation_id").notNull(),
    payload: jsonb("payload").notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => [index("outbox_aggregate_idx").on(table.aggregateType, table.aggregateId, table.occurredAt)]
);
