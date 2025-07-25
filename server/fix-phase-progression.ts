
import { db } from "./db";
import { events, phases, contestants, contestantPhases } from "@shared/schema";
import { eq, and } from "drizzle-orm";

async function fixPhaseProgression() {
  console.log("🔄 Fixing phase progression setup...");
  
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
      
      // Get all contestants for this event
      const eventContestants = await db
        .select()
        .from(contestants)
        .where(eq(contestants.eventId, event.id));
      
      console.log(`  👥 Found ${eventContestants.length} contestants`);
      console.log(`  🏁 Found ${eventPhases.length} phases`);
      
      // Find the first phase (lowest order number)
      const firstPhase = eventPhases[0];
      console.log(`  🥇 First phase: ${firstPhase.name} (order: ${firstPhase.order})`);
      
      // Check which contestants are already in the first phase
      const existingParticipations = await db
        .select()
        .from(contestantPhases)
        .where(and(
          eq(contestantPhases.phaseId, firstPhase.id),
          eq(contestantPhases.status, 'active')
        ));
      
      const existingContestantIds = existingParticipations.map(cp => cp.contestantId);
      const missingContestants = eventContestants.filter(c => !existingContestantIds.includes(c.id));
      
      console.log(`  ✅ Already in first phase: ${existingParticipations.length}`);
      console.log(`  ➕ Need to add to first phase: ${missingContestants.length}`);
      
      // Add missing contestants to the first phase
      if (missingContestants.length > 0) {
        const insertData = missingContestants.map(contestant => ({
          contestantId: contestant.id,
          phaseId: firstPhase.id,
          status: 'active' as const,
        }));
        
        await db.insert(contestantPhases).values(insertData);
        console.log(`  ✨ Added ${missingContestants.length} contestants to first phase`);
      }
      
      // Make sure the first phase is active if no phase is currently active
      const activePhase = eventPhases.find(p => p.status === 'active');
      if (!activePhase) {
        await db
          .update(phases)
          .set({ status: 'active' })
          .where(eq(phases.id, firstPhase.id));
        
        console.log(`  🎯 Activated first phase: ${firstPhase.name}`);
      }
    }
    
    console.log("\n✅ Phase progression setup completed!");
    
  } catch (error) {
    console.error("❌ Error fixing phase progression:", error);
    throw error;
  }
}

// Run the fix
fixPhaseProgression()
  .then(() => {
    console.log("🎉 All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  });
