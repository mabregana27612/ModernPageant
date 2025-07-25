
import { db } from "./db";
import { events, phases, contestants, contestantPhases, scores } from "@shared/schema";
import { eq, and } from "drizzle-orm";

async function resetToFirstPhase() {
  console.log("🔄 Resetting phases to start from first phase...");
  
  try {
    // Get all events
    const allEvents = await db.select().from(events);
    
    for (const event of allEvents) {
      console.log(`\n📅 Processing event: ${event.name}`);
      
      // Get phases for this event, ordered by phase order
      const eventPhases = await db
        .select()
        .from(phases)
        .where(eq(phases.eventId, event.id))
        .orderBy(phases.order);
      
      if (eventPhases.length === 0) {
        console.log("  ❌ No phases found for this event");
        continue;
      }
      
      console.log(`Found phases: ${eventPhases.map(p => p.name)}`);
      
      const firstPhase = eventPhases[0];
      
      // Reset all phases - first phase should be active, others pending
      for (const phase of eventPhases) {
        const newStatus = phase.id === firstPhase.id ? 'active' : 'pending';
        await db
          .update(phases)
          .set({ status: newStatus })
          .where(eq(phases.id, phase.id));
      }
      
      // Clear all contestant phase assignments
      await db
        .delete(contestantPhases)
        .where(eq(contestantPhases.phaseId, eventPhases.map(p => p.id)[0]));
      
      // Get all contestants for this event
      const eventContestants = await db
        .select()
        .from(contestants)
        .where(eq(contestants.eventId, event.id));
      
      // Add all contestants to first phase
      if (eventContestants.length > 0) {
        const participations = eventContestants.map(contestant => ({
          contestantId: contestant.id,
          phaseId: firstPhase.id,
          status: 'active' as const,
        }));
        
        await db.insert(contestantPhases).values(participations);
        console.log(`  ✅ Added ${participations.length} contestants to first phase: ${firstPhase.name}`);
      }
      
      console.log(`Updated phases: ${eventPhases.map(p => `${p.name} (${p.id === firstPhase.id ? 'active' : 'pending'})`)}`);
    }
    
    console.log("\n🎯 Phase reset completed! You can now test progression from Preliminaries → Semi-Finals");
    
  } catch (error) {
    console.error("❌ Error resetting phases:", error);
    throw error;
  }
}

// Run the reset
resetToFirstPhase()
  .then(() => {
    console.log("🎉 Reset completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Reset failed:", error);
    process.exit(1);
  });
