/**
 * Initialize first phase with all contestants
 * This script should be run when starting a new event to ensure all contestants
 * are eligible for the first phase.
 */

import { db } from "./db";
import { events, phases, contestants, contestantPhases } from "@shared/schema";
import { eq } from "drizzle-orm";

async function initializeFirstPhase() {
  try {
    // Get all active events
    const activeEvents = await db
      .select()
      .from(events)
      .where(eq(events.status, 'active'));

    console.log(`Found ${activeEvents.length} active events`);

    for (const event of activeEvents) {
      console.log(`\nProcessing event: ${event.name}`);

      // Get all phases for this event, ordered by phase order
      const eventPhases = await db
        .select()
        .from(phases)
        .where(eq(phases.eventId, event.id))
        .orderBy(phases.order);

      if (eventPhases.length === 0) {
        console.log(`  No phases found for event ${event.name}`);
        continue;
      }

      const firstPhase = eventPhases[0];
      console.log(`  First phase: ${firstPhase.name}`);

      // Get all contestants for this event
      const eventContestants = await db
        .select()
        .from(contestants)
        .where(eq(contestants.eventId, event.id));

      console.log(`  Found ${eventContestants.length} contestants`);

      // Check if contestants are already assigned to first phase
      const existingAssignments = await db
        .select()
        .from(contestantPhases)
        .where(eq(contestantPhases.phaseId, firstPhase.id));

      console.log(`  Existing assignments: ${existingAssignments.length}`);

      if (existingAssignments.length === 0 && eventContestants.length > 0) {
        // Add all contestants to first phase
        const participations = eventContestants.map((contestant, index) => ({
          contestantId: contestant.id,
          phaseId: firstPhase.id,
          status: "active" as const,
          rank: index + 1,
          advancedFromPhase: undefined
        }));

        await db.insert(contestantPhases).values(participations);
        console.log(`  ✅ Added ${participations.length} contestants to first phase`);
      } else {
        console.log(`  ⏭️  Contestants already assigned to first phase`);
      }
    }

    console.log('\n✅ First phase initialization completed');
  } catch (error) {
    console.error('❌ Error initializing first phase:', error);
  }
}

// Run the script
initializeFirstPhase().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});