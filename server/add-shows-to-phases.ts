import { db } from "./db";
import { events, shows, criteria, phases } from "@shared/schema";
import { eq } from "drizzle-orm";

async function addShowsToAllPhases() {
  try {
    console.log("Adding shows and criteria to all phases...");

    // Get all events and their phases
    const allEvents = await db.select().from(events);
    
    for (const event of allEvents) {
      console.log(`Processing event: ${event.name}`);
      
      const eventPhases = await db
        .select()
        .from(phases)
        .where(eq(phases.eventId, event.id))
        .orderBy(phases.order);

      for (const phase of eventPhases) {
        console.log(`  Processing phase: ${phase.name}`);
        
        // Check if shows already exist for this phase
        const existingShows = await db
          .select()
          .from(shows)
          .where(eq(shows.phaseId, phase.id));

        if (existingShows.length > 0) {
          console.log(`    Shows already exist for ${phase.name}, skipping...`);
          continue;
        }

        // Create shows based on phase type
        let showData = [];
        
        if (phase.name.toLowerCase().includes('preliminar')) {
          // Preliminary phase - full scoring
          showData = [
            { eventId: event.id, phaseId: phase.id, name: "Interview", description: "Personal interview and Q&A session", weight: "30.00", order: 1, icon: "MessageCircle" },
            { eventId: event.id, phaseId: phase.id, name: "Talent", description: "Individual talent performance", weight: "25.00", order: 2, icon: "Music" },
            { eventId: event.id, phaseId: phase.id, name: "Evening Gown", description: "Evening gown presentation", weight: "25.00", order: 3, icon: "Sparkles" },
            { eventId: event.id, phaseId: phase.id, name: "Swimwear", description: "Swimwear competition", weight: "20.00", order: 4, icon: "Sun" }
          ];
        } else if (phase.name.toLowerCase().includes('semi')) {
          // Semi-final phase - reduced categories
          showData = [
            { eventId: event.id, phaseId: phase.id, name: "Interview", description: "Final interview and Q&A", weight: "40.00", order: 1, icon: "MessageCircle" },
            { eventId: event.id, phaseId: phase.id, name: "Evening Gown", description: "Evening gown presentation", weight: "35.00", order: 2, icon: "Sparkles" },
            { eventId: event.id, phaseId: phase.id, name: "Final Walk", description: "Final presentation walk", weight: "25.00", order: 3, icon: "Footprints" }
          ];
        } else if (phase.name.toLowerCase().includes('final')) {
          // Final phase - focused on key areas
          showData = [
            { eventId: event.id, phaseId: phase.id, name: "Final Question", description: "Final question and answer", weight: "50.00", order: 1, icon: "MessageCircle" },
            { eventId: event.id, phaseId: phase.id, name: "Final Walk", description: "Final presentation walk", weight: "30.00", order: 2, icon: "Footprints" },
            { eventId: event.id, phaseId: phase.id, name: "Overall Impression", description: "Overall performance assessment", weight: "20.00", order: 3, icon: "Star" }
          ];
        } else {
          // Default shows for any other phase
          showData = [
            { eventId: event.id, phaseId: phase.id, name: "Performance", description: "Overall performance evaluation", weight: "60.00", order: 1, icon: "Trophy" },
            { eventId: event.id, phaseId: phase.id, name: "Presentation", description: "Presentation and poise", weight: "40.00", order: 2, icon: "Sparkles" }
          ];
        }

        // Insert shows
        const createdShows = await db.insert(shows).values(showData).returning();
        console.log(`    Created ${createdShows.length} shows for ${phase.name}`);

        // Create criteria for each show
        for (const show of createdShows) {
          const criteriaData = [
            { showId: show.id, name: "Confidence & Poise", description: "Confidence and stage presence", weight: "40.00", order: 1, maxScore: 10 },
            { showId: show.id, name: "Presentation Quality", description: "Overall presentation quality", weight: "35.00", order: 2, maxScore: 10 },
            { showId: show.id, name: "Technical Execution", description: "Technical skill and execution", weight: "25.00", order: 3, maxScore: 10 }
          ];

          await db.insert(criteria).values(criteriaData);
          console.log(`      Added criteria for ${show.name}`);
        }
      }
    }

    console.log("✅ Successfully added shows and criteria to all phases!");

  } catch (error) {
    console.error("❌ Error adding shows to phases:", error);
    process.exit(1);
  }
}

// Run the function
addShowsToAllPhases().then(() => {
  console.log("Setup completed!");
  process.exit(0);
});