import {
  users,
  events,
  contestants,
  judges,
  scoringCriteria,
  subCriteria,
  phases,
  scores,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type Contestant,
  type InsertContestant,
  type Judge,
  type InsertJudge,
  type ScoringCriteria,
  type InsertScoringCriteria,
  type SubCriteria,
  type InsertSubCriteria,
  type Phase,
  type InsertPhase,
  type Score,
  type InsertScore,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Event operations
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  
  // Contestant operations
  getContestants(eventId: string): Promise<(Contestant & { user: User })[]>;
  getContestant(id: string): Promise<Contestant | undefined>;
  createContestant(contestant: InsertContestant): Promise<Contestant>;
  updateContestant(id: string, contestant: Partial<InsertContestant>): Promise<Contestant>;
  
  // Judge operations
  getJudges(eventId: string): Promise<(Judge & { user: User })[]>;
  getJudge(id: string): Promise<Judge | undefined>;
  createJudge(judge: InsertJudge): Promise<Judge>;
  
  // Scoring criteria operations
  getScoringCriteria(eventId: string): Promise<ScoringCriteria[]>;
  createScoringCriteria(criteria: InsertScoringCriteria): Promise<ScoringCriteria>;
  updateScoringCriteria(id: string, criteria: Partial<InsertScoringCriteria>): Promise<ScoringCriteria>;
  deleteScoringCriteria(id: string): Promise<void>;
  
  // Sub-criteria operations
  getSubCriteria(criteriaId: string): Promise<SubCriteria[]>;
  createSubCriteria(subCriteria: InsertSubCriteria): Promise<SubCriteria>;
  updateSubCriteria(id: string, subCriteria: Partial<InsertSubCriteria>): Promise<SubCriteria>;
  deleteSubCriteria(id: string): Promise<void>;
  
  // Phase operations
  getPhases(eventId: string): Promise<Phase[]>;
  createPhase(phase: InsertPhase): Promise<Phase>;
  updatePhase(id: string, phase: Partial<InsertPhase>): Promise<Phase>;
  
  // Score operations
  getScores(eventId: string, phaseId?: string): Promise<(Score & { contestant: Contestant; judge: Judge; criteria: ScoringCriteria })[]>;
  createScore(score: InsertScore): Promise<Score>;
  updateScore(id: string, score: Partial<InsertScore>): Promise<Score>;
  getContestantScores(contestantId: string, phaseId: string): Promise<(Score & { criteria: ScoringCriteria })[]>;
  getJudgeScores(judgeId: string, phaseId: string): Promise<(Score & { contestant: Contestant; criteria: ScoringCriteria })[]>;
  
  // Results operations
  getResults(eventId: string, phaseId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Event operations
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.createdAt));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [created] = await db.insert(events).values(event).returning();
    return created;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event> {
    const [updated] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updated;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Contestant operations
  async getContestants(eventId: string): Promise<(Contestant & { user: User })[]> {
    const results = await db
      .select()
      .from(contestants)
      .innerJoin(users, eq(contestants.userId, users.id))
      .where(eq(contestants.eventId, eventId));
    
    return results.map(result => ({
      ...result.contestants,
      user: result.users
    }));
  }

  async getContestant(id: string): Promise<Contestant | undefined> {
    const [contestant] = await db.select().from(contestants).where(eq(contestants.id, id));
    return contestant;
  }

  async createContestant(contestant: InsertContestant): Promise<Contestant> {
    const [created] = await db.insert(contestants).values(contestant).returning();
    return created;
  }

  async updateContestant(id: string, contestant: Partial<InsertContestant>): Promise<Contestant> {
    const [updated] = await db
      .update(contestants)
      .set(contestant)
      .where(eq(contestants.id, id))
      .returning();
    return updated;
  }

  // Judge operations
  async getJudges(eventId: string): Promise<(Judge & { user: User })[]> {
    const results = await db
      .select()
      .from(judges)
      .innerJoin(users, eq(judges.userId, users.id))
      .where(eq(judges.eventId, eventId));
    
    return results.map(result => ({
      ...result.judges,
      user: result.users
    }));
  }

  async getJudge(id: string): Promise<Judge | undefined> {
    const [judge] = await db.select().from(judges).where(eq(judges.id, id));
    return judge;
  }

  async createJudge(judge: InsertJudge): Promise<Judge> {
    const [created] = await db.insert(judges).values(judge).returning();
    return created;
  }

  // Scoring criteria operations
  async getScoringCriteria(eventId: string): Promise<ScoringCriteria[]> {
    return await db
      .select()
      .from(scoringCriteria)
      .where(eq(scoringCriteria.eventId, eventId));
  }

  async createScoringCriteria(criteria: InsertScoringCriteria): Promise<ScoringCriteria> {
    const [created] = await db.insert(scoringCriteria).values(criteria).returning();
    return created;
  }

  async updateScoringCriteria(id: string, criteria: Partial<InsertScoringCriteria>): Promise<ScoringCriteria> {
    const [updated] = await db
      .update(scoringCriteria)
      .set(criteria)
      .where(eq(scoringCriteria.id, id))
      .returning();
    return updated;
  }

  async deleteScoringCriteria(id: string): Promise<void> {
    await db.delete(scoringCriteria).where(eq(scoringCriteria.id, id));
  }

  // Sub-criteria operations
  async getSubCriteria(criteriaId: string): Promise<SubCriteria[]> {
    return await db
      .select()
      .from(subCriteria)
      .where(eq(subCriteria.criteriaId, criteriaId));
  }

  async createSubCriteria(subCriteriaData: InsertSubCriteria): Promise<SubCriteria> {
    const [created] = await db.insert(subCriteria).values(subCriteriaData).returning();
    return created;
  }

  async updateSubCriteria(id: string, subCriteriaData: Partial<InsertSubCriteria>): Promise<SubCriteria> {
    const [updated] = await db
      .update(subCriteria)
      .set(subCriteriaData)
      .where(eq(subCriteria.id, id))
      .returning();
    return updated;
  }

  async deleteSubCriteria(id: string): Promise<void> {
    await db.delete(subCriteria).where(eq(subCriteria.id, id));
  }

  // Phase operations
  async getPhases(eventId: string): Promise<Phase[]> {
    return await db
      .select()
      .from(phases)
      .where(eq(phases.eventId, eventId))
      .orderBy(phases.order);
  }

  async createPhase(phase: InsertPhase): Promise<Phase> {
    const [created] = await db.insert(phases).values(phase).returning();
    return created;
  }

  async updatePhase(id: string, phase: Partial<InsertPhase>): Promise<Phase> {
    const [updated] = await db
      .update(phases)
      .set(phase)
      .where(eq(phases.id, id))
      .returning();
    return updated;
  }

  async advancePhase(eventId: string): Promise<{ message: string; newPhase?: Phase }> {
    // Get all phases for the event ordered by their sequence
    const allPhases = await db
      .select()
      .from(phases)
      .where(eq(phases.eventId, eventId))
      .orderBy(phases.order);

    if (allPhases.length === 0) {
      throw new Error("No phases found for this event");
    }

    // Find current active phase
    const currentPhase = allPhases.find(p => p.status === 'active');
    
    if (!currentPhase) {
      // If no active phase, activate the first one
      const firstPhase = allPhases[0];
      const [updated] = await db
        .update(phases)
        .set({ status: 'active' })
        .where(eq(phases.id, firstPhase.id))
        .returning();
      
      // Update event's current phase
      await db
        .update(events)
        .set({ currentPhase: firstPhase.name })
        .where(eq(events.id, eventId));

      return { message: "Started first phase", newPhase: updated };
    }

    // Find next phase
    const currentIndex = allPhases.findIndex(p => p.id === currentPhase.id);
    const nextPhase = allPhases[currentIndex + 1];

    if (!nextPhase) {
      // No next phase, mark current as completed and event as completed
      await db
        .update(phases)
        .set({ status: 'completed' })
        .where(eq(phases.id, currentPhase.id));

      await db
        .update(events)
        .set({ status: 'completed', currentPhase: 'completed' })
        .where(eq(events.id, eventId));

      return { message: "Event completed - no more phases" };
    }

    // Mark current phase as completed
    await db
      .update(phases)
      .set({ status: 'completed' })
      .where(eq(phases.id, currentPhase.id));

    // Activate next phase
    const [updatedNextPhase] = await db
      .update(phases)
      .set({ status: 'active' })
      .where(eq(phases.id, nextPhase.id))
      .returning();

    // Update event's current phase
    await db
      .update(events)
      .set({ currentPhase: nextPhase.name })
      .where(eq(events.id, eventId));

    // If next phase has resetScores flag, clear existing scores
    if (nextPhase.resetScores) {
      await db
        .delete(scores)
        .where(and(eq(scores.eventId, eventId), eq(scores.phaseId, nextPhase.id)));
    }

    return { message: `Advanced to ${nextPhase.name}`, newPhase: updatedNextPhase };
  }

  // Score operations
  async getScores(eventId: string, phaseId?: string): Promise<(Score & { contestant: Contestant; judge: Judge; criteria: ScoringCriteria })[]> {
    const baseQuery = db
      .select()
      .from(scores)
      .innerJoin(contestants, eq(scores.contestantId, contestants.id))
      .innerJoin(judges, eq(scores.judgeId, judges.id))
      .innerJoin(scoringCriteria, eq(scores.criteriaId, scoringCriteria.id));

    const results = phaseId
      ? await baseQuery.where(and(eq(scores.eventId, eventId), eq(scores.phaseId, phaseId)))
      : await baseQuery.where(eq(scores.eventId, eventId));

    return results.map(result => ({
      ...result.scores,
      contestant: result.contestants,
      judge: result.judges,
      criteria: result.scoring_criteria
    }));
  }

  async createScore(score: InsertScore): Promise<Score> {
    const [created] = await db.insert(scores).values(score).returning();
    return created;
  }

  async updateScore(id: string, score: Partial<InsertScore>): Promise<Score> {
    const [updated] = await db
      .update(scores)
      .set({ ...score, updatedAt: new Date() })
      .where(eq(scores.id, id))
      .returning();
    return updated;
  }

  async getContestantScores(contestantId: string, phaseId: string): Promise<(Score & { criteria: ScoringCriteria })[]> {
    const results = await db
      .select()
      .from(scores)
      .innerJoin(scoringCriteria, eq(scores.criteriaId, scoringCriteria.id))
      .where(and(eq(scores.contestantId, contestantId), eq(scores.phaseId, phaseId)));
    
    return results.map(result => ({
      ...result.scores,
      criteria: result.scoring_criteria
    }));
  }

  async getJudgeScores(judgeId: string, phaseId: string): Promise<(Score & { contestant: Contestant; criteria: ScoringCriteria })[]> {
    const results = await db
      .select()
      .from(scores)
      .innerJoin(contestants, eq(scores.contestantId, contestants.id))
      .innerJoin(scoringCriteria, eq(scores.criteriaId, scoringCriteria.id))
      .where(and(eq(scores.judgeId, judgeId), eq(scores.phaseId, phaseId)));
    
    return results.map(result => ({
      ...result.scores,
      contestant: result.contestants,
      criteria: result.scoring_criteria
    }));
  }

  async getResults(eventId: string, phaseId: string): Promise<any[]> {
    // Complex query to calculate weighted scores and rankings
    const results = await db
      .select({
        contestantId: contestants.id,
        contestantNumber: contestants.contestantNumber,
        user: users,
        totalScore: sql<number>`SUM(${scores.score} * ${scoringCriteria.weight} / 100)`,
        scores: sql<any>`json_agg(json_build_object('criteria', ${scoringCriteria.name}, 'score', ${scores.score}, 'weight', ${scoringCriteria.weight}))`,
      })
      .from(scores)
      .innerJoin(contestants, eq(scores.contestantId, contestants.id))
      .innerJoin(users, eq(contestants.userId, users.id))
      .innerJoin(scoringCriteria, eq(scores.criteriaId, scoringCriteria.id))
      .where(and(eq(scores.eventId, eventId), eq(scores.phaseId, phaseId)))
      .groupBy(contestants.id, contestants.contestantNumber, users.id, users.firstName, users.lastName, users.profileImageUrl)
      .orderBy(desc(sql`SUM(${scores.score} * ${scoringCriteria.weight} / 100)`));

    return results;
  }
}

export const storage = new DatabaseStorage();
