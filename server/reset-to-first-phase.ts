import { db } from './db';
import { phases, events } from '../shared/schema';
import { eq, and, like } from 'drizzle-orm';

async function resetToFirstPhase() {
  console.log("🔄 Resetting phases to start from first phase...");

  try {
    // Find the test event by name pattern
    const testEvents = await db.select().from(events).where(
      like(events.name, '%Test Pageant%')
    );

    console.log("Found test events:", testEvents.map(e => ({ id: e.id, name: e.name })));

    if (testEvents.length === 0) {
      console.log("❌ No test events found");
      return;
    }

    const testEvent = testEvents[0]; // Use the first test event found
    console.log(`Using event: ${testEvent.name} (${testEvent.id})`);

    // Find the test event phases
    const allPhases = await db.select().from(phases).where(
      eq(phases.eventId, testEvent.id)
    ).orderBy(phases.order);

    console.log("Found phases:", allPhases.map(p => ({ name: p.name, status: p.status, order: p.order })));

    if (allPhases.length === 0) {
      console.log("❌ No phases found for this event");
      return;
    }

    // Set all phases to pending first
    await db.update(phases)
      .set({ status: 'pending' })
      .where(eq(phases.eventId, testEvent.id));

    // Set the first phase (order 1) to active
    const firstPhase = allPhases.find(p => p.order === 1);
    if (firstPhase) {
      await db.update(phases)
        .set({ status: 'active' })
        .where(eq(phases.id, firstPhase.id));

      console.log(`✅ Set ${firstPhase.name} as active phase`);
    }

    // Verify the update
    const updatedPhases = await db.select().from(phases).where(
      eq(phases.eventId, testEvent.id)
    ).orderBy(phases.order);

    console.log("Updated phases:", updatedPhases.map(p => ({ name: p.name, status: p.status, order: p.order })));
    console.log("🎯 Phase reset completed! You can now test progression from Preliminaries → Semi-Finals");
    console.log("🔄 Refresh your browser to see the changes");

  } catch (error) {
    console.error("❌ Error resetting phases:", error);
  }
}