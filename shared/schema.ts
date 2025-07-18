import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("contestant"), // contestant, judge, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: varchar("status").notNull().default("upcoming"), // upcoming, active, completed
  currentPhase: varchar("current_phase").default("preliminaries"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Scoring criteria table
export const scoringCriteria = pgTable("scoring_criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  name: varchar("name").notNull(),
  description: text("description"),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(), // percentage weight
  maxScore: integer("max_score").notNull().default(10),
  icon: varchar("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Sub-criteria table for detailed scoring breakdown
export const subCriteria = pgTable("sub_criteria", {
  id: uuid("id").primaryKey().defaultRandom(),
  criteriaId: uuid("criteria_id").notNull().references(() => scoringCriteria.id),
  name: varchar("name").notNull(),
  description: text("description"),
  weight: decimal("weight", { precision: 5, scale: 2 }).notNull(), // percentage weight within parent criteria
  maxScore: integer("max_score").notNull().default(10),
  createdAt: timestamp("created_at").defaultNow(),
});

// Competition phases table
export const phases = pgTable("phases", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  name: varchar("name").notNull(),
  order: integer("order").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, active, completed
  resetScores: boolean("reset_scores").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Contestants table
export const contestants = pgTable("contestants", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  contestantNumber: integer("contestant_number").notNull(),
  bio: text("bio"),
  age: integer("age"),
  location: varchar("location"),
  occupation: varchar("occupation"),
  photoUrl: varchar("photo_url"),
  status: varchar("status").notNull().default("registered"), // registered, active, eliminated
  createdAt: timestamp("created_at").defaultNow(),
});

// Judges table
export const judges = pgTable("judges", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  specialization: varchar("specialization"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Scores table
export const scores = pgTable("scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id),
  contestantId: uuid("contestant_id").notNull().references(() => contestants.id),
  judgeId: uuid("judge_id").notNull().references(() => judges.id),
  criteriaId: uuid("criteria_id").notNull().references(() => scoringCriteria.id),
  subCriteriaId: uuid("sub_criteria_id").references(() => subCriteria.id), // Optional: can score main criteria directly or sub-criteria
  phaseId: uuid("phase_id").notNull().references(() => phases.id),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const eventsRelations = relations(events, ({ many }) => ({
  contestants: many(contestants),
  judges: many(judges),
  criteria: many(scoringCriteria),
  phases: many(phases),
  scores: many(scores),
}));

export const contestantsRelations = relations(contestants, ({ one, many }) => ({
  event: one(events, { fields: [contestants.eventId], references: [events.id] }),
  user: one(users, { fields: [contestants.userId], references: [users.id] }),
  scores: many(scores),
}));

export const judgesRelations = relations(judges, ({ one, many }) => ({
  event: one(events, { fields: [judges.eventId], references: [events.id] }),
  user: one(users, { fields: [judges.userId], references: [users.id] }),
  scores: many(scores),
}));

export const scoringCriteriaRelations = relations(scoringCriteria, ({ one, many }) => ({
  event: one(events, { fields: [scoringCriteria.eventId], references: [events.id] }),
  scores: many(scores),
  subCriteria: many(subCriteria),
}));

export const subCriteriaRelations = relations(subCriteria, ({ one, many }) => ({
  criteria: one(scoringCriteria, { fields: [subCriteria.criteriaId], references: [scoringCriteria.id] }),
  scores: many(scores),
}));

export const phasesRelations = relations(phases, ({ one, many }) => ({
  event: one(events, { fields: [phases.eventId], references: [events.id] }),
  scores: many(scores),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  event: one(events, { fields: [scores.eventId], references: [events.id] }),
  contestant: one(contestants, { fields: [scores.contestantId], references: [contestants.id] }),
  judge: one(judges, { fields: [scores.judgeId], references: [judges.id] }),
  criteria: one(scoringCriteria, { fields: [scores.criteriaId], references: [scoringCriteria.id] }),
  subCriteria: one(subCriteria, { fields: [scores.subCriteriaId], references: [subCriteria.id] }),
  phase: one(phases, { fields: [scores.phaseId], references: [phases.id] }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertEventSchema = createInsertSchema(events).extend({
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
});
export const insertContestantSchema = createInsertSchema(contestants);
export const insertJudgeSchema = createInsertSchema(judges);
export const insertScoringCriteriaSchema = createInsertSchema(scoringCriteria);
export const insertSubCriteriaSchema = createInsertSchema(subCriteria);
export const insertPhaseSchema = createInsertSchema(phases);
export const insertScoreSchema = createInsertSchema(scores);

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Contestant = typeof contestants.$inferSelect;
export type InsertContestant = z.infer<typeof insertContestantSchema>;
export type Judge = typeof judges.$inferSelect;
export type InsertJudge = z.infer<typeof insertJudgeSchema>;
export type ScoringCriteria = typeof scoringCriteria.$inferSelect;
export type InsertScoringCriteria = z.infer<typeof insertScoringCriteriaSchema>;
export type SubCriteria = typeof subCriteria.$inferSelect;
export type InsertSubCriteria = z.infer<typeof insertSubCriteriaSchema>;
export type Phase = typeof phases.$inferSelect;
export type InsertPhase = z.infer<typeof insertPhaseSchema>;
export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;
