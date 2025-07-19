import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEventSchema, insertContestantSchema, insertJudgeSchema, insertShowSchema, insertCriteriaSchema, insertPhaseSchema, insertScoreSchema } from "@shared/schema";
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

  app.patch('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const event = await storage.updateEvent(req.params.id, req.body);
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.json({ message: "Event deleted successfully" });
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

  // Shows routes (main categories that generate phases)
  app.get('/api/events/:eventId/shows', async (req, res) => {
    try {
      const shows = await storage.getShows(req.params.eventId);
      res.json(shows);
    } catch (error) {
      console.error("Error fetching shows:", error);
      res.status(500).json({ message: "Failed to fetch shows" });
    }
  });

  app.post('/api/events/:eventId/shows', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertShowSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
      });
      const show = await storage.createShow(validatedData);
      res.status(201).json(show);
    } catch (error) {
      console.error("Error creating show:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }
      res.status(500).json({ message: "Failed to create show" });
    }
  });

  app.patch('/api/shows/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertShowSchema.partial().parse(req.body);
      const show = await storage.updateShow(req.params.id, validatedData);
      res.json(show);
    } catch (error) {
      console.error("Error updating show:", error);
      res.status(500).json({ message: "Failed to update show" });
    }
  });

  app.delete('/api/shows/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteShow(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting show:", error);
      res.status(500).json({ message: "Failed to delete show" });
    }
  });

  // Legacy route for backward compatibility - map to shows
  // Legacy routes have been removed - use /api/events/:eventId/shows instead

  // Criteria routes (individual scoring elements within shows)
  app.get('/api/shows/:showId/criteria', async (req, res) => {
    try {
      const criteria = await storage.getCriteria(req.params.showId);
      res.json(criteria);
    } catch (error) {
      console.error("Error fetching criteria:", error);
      res.status(500).json({ message: "Failed to fetch criteria" });
    }
  });

  app.post('/api/shows/:showId/criteria', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCriteriaSchema.parse({
        ...req.body,
        showId: req.params.showId,
      });
      const criteria = await storage.createCriteria(validatedData);
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

  app.patch('/api/criteria/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertCriteriaSchema.partial().parse(req.body);
      const criteria = await storage.updateCriteria(req.params.id, validatedData);
      res.json(criteria);
    } catch (error) {
      console.error("Error updating criteria:", error);
      res.status(500).json({ message: "Failed to update criteria" });
    }
  });

  app.delete('/api/criteria/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCriteria(req.params.id);
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

  app.get('/api/phases/:id', async (req, res) => {
    try {
      const phase = await storage.getPhase(req.params.id);
      if (!phase) {
        return res.status(404).json({ message: "Phase not found" });
      }
      res.json(phase);
    } catch (error) {
      console.error("Error fetching phase:", error);
      res.status(500).json({ message: "Failed to fetch phase" });
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
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }
      res.status(500).json({ message: "Failed to create phase" });
    }
  });

  app.patch('/api/phases/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPhaseSchema.partial().parse(req.body);
      const phase = await storage.updatePhase(req.params.id, validatedData);
      res.json(phase);
    } catch (error) {
      console.error("Error updating phase:", error);
      res.status(500).json({ message: "Failed to update phase" });
    }
  });

  app.delete('/api/phases/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deletePhase(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting phase:", error);
      res.status(500).json({ message: "Failed to delete phase" });
    }
  });

  app.post('/api/events/:eventId/phases/reorder', isAuthenticated, async (req, res) => {
    try {
      const { phaseOrders } = req.body;
      await storage.reorderPhases(req.params.eventId, phaseOrders);
      res.json({ message: "Phases reordered successfully" });
    } catch (error) {
      console.error("Error reordering phases:", error);
      res.status(500).json({ message: "Failed to reorder phases" });
    }
  });

  app.post('/api/events/:eventId/advance-phase', isAuthenticated, async (req, res) => {
    try {
      const result = await storage.advancePhase(req.params.eventId);
      res.json(result);
    } catch (error) {
      console.error("Error advancing phase:", error);
      res.status(500).json({ message: "Failed to advance phase" });
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

  // Get scoring progress for a judge
  app.get('/api/events/:eventId/scoring-progress', isAuthenticated, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const contestants = await storage.getContestants(req.params.eventId);
      const shows = await storage.getShows(req.params.eventId);
      const phases = await storage.getPhases(req.params.eventId);
      const activePhase = phases.find(p => p.status === 'active') || phases[0];
      
      if (!activePhase) {
        return res.json({ totalRequired: 0, completed: 0, progress: 100 });
      }

      // Get criteria for the active phase's show
      const activeShow = shows.find(s => s.id === activePhase.showId);
      if (!activeShow) {
        return res.json({ totalRequired: 0, completed: 0, progress: 100 });
      }

      const criteria = await storage.getCriteria(activeShow.id);
      const judges = await storage.getJudges(req.params.eventId);
      const judge = judges.find(j => j.userId === req.user.id);
      
      if (!judge) {
        const totalRequired = contestants.length * criteria.length;
        return res.json({ 
          totalRequired, 
          completed: 0, 
          progress: 0,
          remainingContestants: contestants.length,
          remainingCriteria: criteria.length
        });
      }

      const judgeScores = await storage.getJudgeScores(judge.id, activePhase.id);
      const totalRequired = contestants.length * criteria.length;
      const completed = judgeScores.length;
      const progress = totalRequired > 0 ? Math.round((completed / totalRequired) * 100) : 100;

      res.json({ 
        totalRequired, 
        completed, 
        progress,
        remainingContestants: contestants.length,
        remainingCriteria: criteria.length,
        activePhase: activePhase.name,
        activeShow: activeShow.name
      });
    } catch (error) {
      console.error("Error fetching scoring progress:", error);
      res.status(500).json({ message: "Failed to fetch scoring progress" });
    }
  });

  app.post('/api/events/:eventId/scores', isAuthenticated, async (req, res) => {
    try {
      console.log("Current user:", req.user);
      
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get or create judge record for current user
      const judges = await storage.getJudges(req.params.eventId);
      let judge = judges.find(j => j.userId === req.user.id);
      
      if (!judge) {
        // Create judge record if it doesn't exist
        judge = await storage.createJudge({
          eventId: req.params.eventId,
          userId: req.user.id,
          specialization: "Judge"
        });
      }

      // Get the show ID from criteria
      const allCriteria = await storage.getAllCriteria();
      const criteria = allCriteria.find(c => c.id === req.body.criteriaId);
      if (!criteria) {
        return res.status(400).json({ message: "Criteria not found" });
      }

      const validatedData = insertScoreSchema.parse({
        ...req.body,
        eventId: req.params.eventId,
        judgeId: judge.id,
        showId: criteria.showId,
      });
      
      const score = await storage.createScore(validatedData);
      res.status(201).json(score);
    } catch (error) {
      console.error("Error creating score:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message
          }))
        });
      }
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

  // Legacy scoring criteria routes removed - use shows/criteria structure instead

  // These routes have been removed as part of the Shows/Criteria migration
  // Sub-criteria functionality is now handled through the Shows/Criteria structure

  const httpServer = createServer(app);
  return httpServer;
}