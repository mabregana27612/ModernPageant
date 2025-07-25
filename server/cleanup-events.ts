
import { db } from "./db";
import { 
  events, 
  contestants, 
  judges, 
  shows, 
  criteria, 
  phases, 
  scores, 
  contestantPhases 
} from "@shared/schema";

async function cleanupEvents() {
  try {
    console.log("🧹 Starting cleanup of all event data...");

    // Delete in order to respect foreign key constraints
    console.log("Deleting scores...");
    await db.delete(scores);
    
    console.log("Deleting contestant phases...");
    await db.delete(contestantPhases);
    
    console.log("Deleting criteria...");
    await db.delete(criteria);
    
    console.log("Deleting shows...");
    await db.delete(shows);
    
    console.log("Deleting phases...");
    await db.delete(phases);
    
    console.log("Deleting contestants...");
    await db.delete(contestants);
    
    console.log("Deleting judges...");
    await db.delete(judges);
    
    console.log("Deleting events...");
    await db.delete(events);

    console.log("✅ All event data has been successfully cleaned up!");
    console.log("You can now create new events from scratch.");

  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  }
}

cleanupEvents();
