import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEventSchema, insertContestantSchema, insertJudgeSchema, insertScoringCriteriaSchema, insertPhaseSchema, insertScoreSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.post('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.upsertUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Event routes
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.patch('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(req.params.id, validatedData);
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Contestant routes
  app.get('/api/events/:eventId/contestants', async (req, res) => {
    try {
      const contestants = await storage.getContestants(req.params.eventId);
      res.json(contestants);
    } catch (error) {
      console.error("Error fetching contestants:", error);
      res.status(500).json({ message: "Failed to fetch contestants" });
    }
  });

  app.post('/api/events/:eventId/contestants', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertContestantSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
      });
      const contestant = await storage.createContestant(validatedData);
      res.status(201).json(contestant);
    } catch (error) {
      console.error("Error creating contestant:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }
      res.status(500).json({ message: "Failed to create contestant" });
    }
  });

  // Judge routes
  app.get('/api/events/:eventId/judges', async (req, res) => {
    try {
      const judges = await storage.getJudges(req.params.eventId);
      res.json(judges);
    } catch (error) {
      console.error("Error fetching judges:", error);
      res.status(500).json({ message: "Failed to fetch judges" });
    }
  });

  app.post('/api/events/:eventId/judges', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertJudgeSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
      });
      const judge = await storage.createJudge(validatedData);
      res.status(201).json(judge);
    } catch (error) {
      console.error("Error creating judge:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }
      res.status(500).json({ message: "Failed to create judge" });
    }
  });

  // Scoring criteria routes
  app.get('/api/events/:eventId/criteria', async (req, res) => {
    try {
      const criteria = await storage.getScoringCriteria(req.params.eventId);
      res.json(criteria);
    } catch (error) {
      console.error("Error fetching criteria:", error);
      res.status(500).json({ message: "Failed to fetch criteria" });
    }
  });

  app.post('/api/events/:eventId/criteria', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertScoringCriteriaSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
      });
      const criteria = await storage.createScoringCriteria(validatedData);
      res.status(201).json(criteria);
    } catch (error) {
      console.error("Error creating criteria:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }
      res.status(500).json({ message: "Failed to create criteria" });
    }
  });

  app.patch('/api/events/:eventId/criteria/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertScoringCriteriaSchema.partial().parse(req.body);
      const criteria = await storage.updateScoringCriteria(req.params.id, validatedData);
      res.json(criteria);
    } catch (error) {
      console.error("Error updating criteria:", error);
      res.status(500).json({ message: "Failed to update criteria" });
    }
  });

  app.delete('/api/events/:eventId/criteria/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteScoringCriteria(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting criteria:", error);
      res.status(500).json({ message: "Failed to delete criteria" });
    }
  });

  // Phase routes
  app.get('/api/events/:eventId/phases', async (req, res) => {
    try {
      const phases = await storage.getPhases(req.params.eventId);
      res.json(phases);
    } catch (error) {
      console.error("Error fetching phases:", error);
      res.status(500).json({ message: "Failed to fetch phases" });
    }
  });

  app.post('/api/events/:eventId/phases', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPhaseSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
      });
      const phase = await storage.createPhase(validatedData);
      res.status(201).json(phase);
    } catch (error) {
      console.error("Error creating phase:", error);
      res.status(500).json({ message: "Failed to create phase" });
    }
  });

  app.patch('/api/events/:eventId/phases/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPhaseSchema.partial().parse(req.body);
      const phase = await storage.updatePhase(req.params.id, validatedData);
      res.json(phase);
    } catch (error) {
      console.error("Error updating phase:", error);
      res.status(500).json({ message: "Failed to update phase" });
    }
  });

  // Score routes
  app.get('/api/events/:eventId/scores', async (req, res) => {
    try {
      const { phaseId } = req.query;
      const scores = await storage.getScores(req.params.eventId, phaseId as string);
      res.json(scores);
    } catch (error) {
      console.error("Error fetching scores:", error);
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });

  app.post('/api/events/:eventId/scores', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertScoreSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
      });
      const score = await storage.createScore(validatedData);
      res.status(201).json(score);
    } catch (error) {
      console.error("Error creating score:", error);
      res.status(500).json({ message: "Failed to create score" });
    }
  });

  app.patch('/api/events/:eventId/scores/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertScoreSchema.partial().parse(req.body);
      const score = await storage.updateScore(req.params.id, validatedData);
      res.json(score);
    } catch (error) {
      console.error("Error updating score:", error);
      res.status(500).json({ message: "Failed to update score" });
    }
  });

  // Results routes
  app.get('/api/events/:eventId/results', async (req, res) => {
    try {
      const { phaseId } = req.query;
      if (!phaseId) {
        return res.status(400).json({ message: "Phase ID is required" });
      }
      const results = await storage.getResults(req.params.eventId, phaseId as string);
      res.json(results);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  // Get results for active event
  app.get('/api/results', async (req, res) => {
    try {
      const events = await storage.getEvents();
      const activeEvent = events.find(e => e.status === 'active');
      
      if (!activeEvent) {
        return res.json([]);
      }
      
      const phases = await storage.getPhases(activeEvent.id);
      const activePhase = phases.find(p => p.status === 'active') || phases[0];
      
      if (!activePhase) {
        return res.json([]);
      }
      
      const results = await storage.getResults(activeEvent.id, activePhase.id);
      res.json(results);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
