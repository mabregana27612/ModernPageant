
import { db } from "./db";
import { events, phases } from "@shared/schema";
import { eq } from "drizzle-orm";

async function migratePhases() {
  try {
    console.log("Migrating phases for existing events...");

    // Get all events
    const allEvents = await db.select().from(events);
    
    for (const event of allEvents) {
      // Check if event already has phases
      const existingPhases = await db.select().from(phases).where(eq(phases.eventId, event.id));
      
      if (existingPhases.length > 0) {
        console.log(`Event "${event.name}" already has phases, skipping...`);
        continue;
      }

      // Create default phases based on event status
      const phaseData = [];
      
      if (event.status === 'active') {
        phaseData.push(
          {
            eventId: event.id,
            name: "Preliminaries",
            description: "Initial judging round with all contestants",
            status: "completed",
            order: 1,
            resetScores: false
          },
          {
            eventId: event.id,
            name: "Semi-Finals",
            description: "Top contestants advance to semi-final round",
            status: "completed",
            order: 2,
            resetScores: false
          },
          {
            eventId: event.id,
            name: "Finals",
            description: "Final competition round",
            status: "active",
            order: 3,
            resetScores: true
          }
        );
      } else if (event.status === 'upcoming') {
        phaseData.push(
          {
            eventId: event.id,
            name: "Registration",
            description: "Contestant registration and verification",
            status: "active",
            order: 1,
            resetScores: false
          },
          {
            eventId: event.id,
            name: "Preliminaries",
            description: "Initial judging round with all contestants",
            status: "pending",
            order: 2,
            resetScores: false
          },
          {
            eventId: event.id,
            name: "Finals",
            description: "Final competition round",
            status: "pending",
            order: 3,
            resetScores: true
          }
        );
      } else if (event.status === 'completed') {
        phaseData.push(
          {
            eventId: event.id,
            name: "Preliminaries",
            description: "Initial judging round with all contestants",
            status: "completed",
            order: 1,
            resetScores: false
          },
          {
            eventId: event.id,
            name: "Finals",
            description: "Final competition round",
            status: "completed",
            order: 2,
            resetScores: true
          }
        );
      }

      if (phaseData.length > 0) {
        await db.insert(phases).values(phaseData);
        console.log(`✅ Created ${phaseData.length} phases for event "${event.name}"`);
      }
    }

    console.log("✅ Phase migration completed!");

  } catch (error) {
    console.error("❌ Error migrating phases:", error);
  }
}

migratePhases();
