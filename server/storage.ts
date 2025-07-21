import {
  users,
  events,
  contestants,
  judges,
  shows,
  criteria,
  phases,
  contestantPhases,
  scores,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type Contestant,
  type InsertContestant,
  type Judge,
  type InsertJudge,
  type Show,
  type InsertShow,
  type Criteria,
  type InsertCriteria,
  type Phase,
  type InsertPhase,
  type ContestantPhase,
  type InsertContestantPhase,
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

  // Show operations (main categories that generate phases)
  getShows(eventId: string): Promise<Show[]>;
  createShow(show: InsertShow): Promise<Show>;
  updateShow(id: string, show: Partial<InsertShow>): Promise<Show>;
  deleteShow(id: string): Promise<void>;

  // Criteria operations (individual scoring elements within shows)
  getCriteria(showId: string): Promise<Criteria[]>;
  createCriteria(criteria: InsertCriteria): Promise<Criteria>;
  updateCriteria(id: string, criteria: Partial<InsertCriteria>): Promise<Criteria>;
  deleteCriteria(id: string): Promise<void>;

  // Phase operations
  getPhases(eventId: string): Promise<Phase[]>;
  createPhase(phase: InsertPhase): Promise<Phase>;
  updatePhase(id: string, phase: Partial<InsertPhase>): Promise<Phase>;

  // Contestant Phase operations
  getContestantPhases(phaseId: string): Promise<ContestantPhase[]>;
  addContestantsToPhase(contestantIds: string[], phaseId: string, advancedFromPhase?: string): Promise<ContestantPhase[]>;
  getEligibleContestants(phaseId: string): Promise<(Contestant & { user: User })[]>;
  advanceContestantsToNextPhase(eventId: string, selectedContestantIds: string[]): Promise<{ message: string; advancedCount: number }>;

  // Score operations
  getScores(eventId: string, phaseId?: string): Promise<(Score & { contestant: Contestant; judge: Judge; criteria: Criteria })[]>;
  createScore(score: InsertScore): Promise<Score>;
  updateScore(id: string, score: Partial<InsertScore>): Promise<Score>;
  getContestantScores(contestantId: string, phaseId: string): Promise<(Score & { show: Show; criteria: Criteria })[]>;
  getJudgeScores(judgeId: string, phaseId: string): Promise<(Score & { contestant: Contestant; show: Show; criteria: Criteria })[]>;
  getScoresByJudge(eventId: string, judgeId: string, phaseId?: string): Promise<any[]>;

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

  // Show operations (main categories that generate phases)
  async getShows(eventId: string): Promise<Show[]> {
    return await db
      .select()
      .from(shows)
      .where(eq(shows.eventId, eventId))
      .orderBy(shows.order);
  }

  async createShow(showData: InsertShow): Promise<Show> {
    const [created] = await db.insert(shows).values(showData).returning();

    // Automatically create a phase for this show
    await db.insert(phases).values({
      eventId: showData.eventId,
      showId: created.id,
      name: created.name,
      order: created.order,
      status: 'pending',
      resetScores: false,
    });

    return created;
  }

  async updateShow(id: string, showData: Partial<InsertShow>): Promise<Show> {
    const [updated] = await db
      .update(shows)
      .set(showData)
      .where(eq(shows.id, id))
      .returning();
    return updated;
  }

  async deleteShow(id: string): Promise<void> {
    await db.delete(shows).where(eq(shows.id, id));
  }

  // Criteria operations (individual scoring elements within shows)
  async getCriteria(showId: string): Promise<Criteria[]> {
    return await db
      .select()
      .from(criteria)
      .where(eq(criteria.showId, showId));
  }

  async getAllCriteria(): Promise<Criteria[]> {
    return await db
      .select()
      .from(criteria);
  }

  async createCriteria(criteriaData: InsertCriteria): Promise<Criteria> {
    const [created] = await db.insert(criteria).values(criteriaData).returning();
    return created;
  }

  async updateCriteria(id: string, criteriaData: Partial<InsertCriteria>): Promise<Criteria> {
    const [updated] = await db
      .update(criteria)
      .set(criteriaData)
      .where(eq(criteria.id, id))
      .returning();
    return updated;
  }

  async deleteCriteria(id: string): Promise<void> {
    await db.delete(criteria).where(eq(criteria.id, id));
  }

  // Phase operations
  async getPhases(eventId: string): Promise<Phase[]> {
    return await db
      .select()
      .from(phases)
      .where(eq(phases.eventId, eventId))
      .orderBy(phases.order);
  }

  async getPhase(id: string): Promise<Phase | undefined> {
    const [phase] = await db.select().from(phases).where(eq(phases.id, id));
    return phase;
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

  async deletePhase(id: string): Promise<void> {
    // First delete all scores associated with this phase
    await db.delete(scores).where(eq(scores.phaseId, id));
    // Then delete the phase
    await db.delete(phases).where(eq(phases.id, id));
  }

  async reorderPhases(eventId: string, phaseOrders: { id: string; order: number }[]): Promise<void> {
    // Update phases order in a transaction
    for (const phaseOrder of phaseOrders) {
      await db
        .update(phases)
        .set({ order: phaseOrder.order })
        .where(eq(phases.id, phaseOrder.id));
    }
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

  // Contestant Phase operations
  async getContestantPhases(phaseId: string): Promise<ContestantPhase[]> {
    return await db
      .select()
      .from(contestantPhases)
      .where(eq(contestantPhases.phaseId, phaseId));
  }

  async addContestantsToPhase(contestantIds: string[], phaseId: string, advancedFromPhase?: string): Promise<ContestantPhase[]> {
    const participations = contestantIds.map((contestantId, index) => ({
      contestantId,
      phaseId,
      advancedFromPhase,
      rank: index + 1, // Assign ranking based on order
      status: "active" as const
    }));

    return await db.insert(contestantPhases).values(participations).returning();
  }

  async getEligibleContestants(phaseId: string): Promise<(Contestant & { user: User })[]> {
    // Get contestants who are eligible for this phase
    const participations = await db
      .select({
        contestant: contestants,
        user: users
      })
      .from(contestantPhases)
      .innerJoin(contestants, eq(contestantPhases.contestantId, contestants.id))
      .innerJoin(users, eq(contestants.userId, users.id))
      .where(and(
        eq(contestantPhases.phaseId, phaseId),
        eq(contestantPhases.status, 'active')
      ));

    return participations.map(p => ({ ...p.contestant, user: p.user }));
  }

  async advanceContestantsToNextPhase(eventId: string, selectedContestantIds: string[]): Promise<{ message: string; advancedCount: number }> {
    // Get current active phase
    const allPhases = await db
      .select()
      .from(phases)
      .where(eq(phases.eventId, eventId))
      .orderBy(phases.order);

    const currentPhase = allPhases.find(p => p.status === 'active');
    if (!currentPhase) {
      throw new Error("No active phase found");
    }

    // Find next phase
    const currentIndex = allPhases.findIndex(p => p.id === currentPhase.id);
    const nextPhase = allPhases[currentIndex + 1];

    if (!nextPhase) {
      throw new Error("No next phase available");
    }

    // Add selected contestants to next phase
    await this.addContestantsToPhase(selectedContestantIds, nextPhase.id, currentPhase.id);

    // Eliminate non-selected contestants from current phase
    const allCurrentContestants = await this.getContestantPhases(currentPhase.id);
    const eliminatedIds = allCurrentContestants
      .map(cp => cp.contestantId)
      .filter(id => !selectedContestantIds.includes(id));

    if (eliminatedIds.length > 0) {
      await db
        .update(contestantPhases)
        .set({ status: 'eliminated' })
        .where(and(
          eq(contestantPhases.phaseId, currentPhase.id),
          sql`contestant_id = ANY(${eliminatedIds})`
        ));
    }

    return {
      message: `Advanced ${selectedContestantIds.length} contestants to ${nextPhase.name}`,
      advancedCount: selectedContestantIds.length
    };
  }

  async getScores(eventId: string, phaseId?: string): Promise<(Score & { contestant: Contestant; judge: Judge; show: Show; criteria: Criteria })[]> {
    const baseQuery = db
      .select()
      .from(scores)
      .innerJoin(contestants, eq(scores.contestantId, contestants.id))
      .innerJoin(judges, eq(scores.judgeId, judges.id))
      .innerJoin(criteria, eq(scores.criteriaId, criteria.id))
      .innerJoin(shows, eq(scores.showId, shows.id));

    const results = phaseId
      ? await baseQuery.where(and(eq(scores.eventId, eventId), eq(scores.phaseId, phaseId)))
      : await baseQuery.where(eq(scores.eventId, eventId));

    return results.map(result => ({
      ...result.scores,
      contestant: result.contestants,
      judge: result.judges,
      show: result.shows,
      criteria: result.criteria
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

  async getContestantScores(contestantId: string, phaseId: string): Promise<(Score & { criteria: Criteria })[]> {
    const results = await db
      .select()
      .from(scores)
      .innerJoin(criteria, eq(scores.criteriaId, criteria.id))
      .where(and(eq(scores.contestantId, contestantId), eq(scores.phaseId, phaseId)));

    return results.map(result => ({
      ...result.scores,
      criteria: result.criteria
    }));
  }

  async getJudgeScores(judgeId: string, phaseId: string): Promise<(Score & { contestant: Contestant; criteria: Criteria })[]> {
    const results = await db
      .select()
      .from(scores)
      .innerJoin(contestants, eq(scores.contestantId, contestants.id))
      .innerJoin(criteria, eq(scores.criteriaId, criteria.id))
      .where(and(eq(scores.judgeId, judgeId), eq(scores.phaseId, phaseId)));

    return results.map(result => ({
      ...result.scores,
      contestant: result.contestants,
      criteria: result.criteria
    }));
  }

  async getScoresByJudge(eventId: string, judgeId: string, phaseId?: string): Promise<any[]> {
    try {
      let query = db.select({
        id: scores.id,
        eventId: scores.eventId,
        contestantId: scores.contestantId,
        judgeId: scores.judgeId,
        showId: scores.showId,
        criteriaId: scores.criteriaId,
        phaseId: scores.phaseId,
        score: scores.score,
        createdAt: scores.createdAt,
        updatedAt: scores.updatedAt,
        contestantName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        criteriaName: criteria.name,
      })
      .from(scores)
      .leftJoin(contestants, eq(scores.contestantId, contestants.id))
      .leftJoin(users, eq(contestants.userId, users.id))
      .leftJoin(criteria, eq(scores.criteriaId, criteria.id))
      .where(and(
        eq(scores.eventId, eventId),
        eq(scores.judgeId, judgeId)
      ));

      if (phaseId) {
        query = query.where(eq(scores.phaseId, phaseId));
      }

      return await query;
    } catch (error) {
      console.error("Error fetching judge scores:", error);
      throw error;
    }
  }

  async getScoresWithDetails(eventId: string, phaseId?: string): Promise<any[]> {
    try {
      let query = db.select({
        id: scores.id,
        eventId: scores.eventId,
        contestantId: scores.contestantId,
        judgeId: scores.judgeId,
        showId: scores.showId,
        criteriaId: scores.criteriaId,
        phaseId: scores.phaseId,
        score: scores.score,
        createdAt: scores.createdAt,
        updatedAt: scores.updatedAt,
        contestantName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        criteriaName: criteria.name,
        showName: shows.name,
      })
      .from(scores)
      .leftJoin(contestants, eq(scores.contestantId, contestants.id))
      .leftJoin(users, eq(contestants.userId, users.id))
      .leftJoin(criteria, eq(scores.criteriaId, criteria.id))
      .leftJoin(shows, eq(scores.showId, shows.id))
      .where(eq(scores.eventId, eventId));

      if (phaseId) {
        query = query.where(eq(scores.phaseId, phaseId));
      }

      return await query.orderBy(scores.createdAt);
    } catch (error) {
      console.error("Error fetching scores with details:", error);
      throw error;
    }
  }

  async getResults(eventId: string, phaseId: string): Promise<any[]> {
    // Complex query to calculate weighted scores and rankings
    const results = await db
      .select({
        contestantId: contestants.id,
        contestantNumber: contestants.contestantNumber,
        user: users,
        totalScore: sql<number>`SUM(${scores.score} * ${criteria.weight} / 100)`,
        scores: sql<any>`json_agg(json_build_object('criteria', ${criteria.name}, 'score', ${scores.score}, 'weight', ${criteria.weight}))`,
      })
      .from(scores)
      .innerJoin(contestants, eq(scores.contestantId, contestants.id))
      .innerJoin(users, eq(contestants.userId, users.id))
      .innerJoin(criteria, eq(scores.criteriaId, criteria.id))
      .where(and(eq(scores.eventId, eventId), eq(scores.phaseId, phaseId)))
      .groupBy(contestants.id, contestants.contestantNumber, users.id, users.firstName, users.lastName, users.profileImageUrl)
      .orderBy(desc(sql`SUM(${scores.score} * ${criteria.weight} / 100)`));

    return results;
  }
}

export const storage = new DatabaseStorage();