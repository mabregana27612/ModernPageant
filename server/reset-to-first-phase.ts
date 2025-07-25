
import { db } from './db';
import { phases } from '../shared/schema';
import { eq, and } from 'drizzle-orm';

async function resetToFirstPhase() {
  console.log("🔄 Resetting phases to start from first phase...");
  
  try {
    // Find the test event phases
    const allPhases = await db.select().from(phases).where(
      eq(phases.eventId, 'b35fe253-831f-44ba-891e-99219b986eea') // Your test event ID
    ).orderBy(phases.order);
    
    console.log("Found phases:", allPhases.map(p => ({ name: p.name, status: p.status, order: p.order })));
    
    // Set all phases to pending first
    await db.update(phases)
      .set({ status: 'pending' })
      .where(eq(phases.eventId, 'b35fe253-831f-44ba-891e-99219b986eea'));
    
    // Set the first phase (Preliminaries) to active
    const firstPhase = allPhases.find(p => p.order === 1);
    if (firstPhase) {
      await db.update(phases)
        .set({ status: 'active' })
        .where(eq(phases.id, firstPhase.id));
      
      console.log(`✅ Set ${firstPhase.name} as active phase`);
    }
    
    // Verify the update
    const updatedPhases = await db.select().from(phases).where(
      eq(phases.eventId, 'b35fe253-831f-44ba-891e-99219b986eea')
    ).orderBy(phases.order);
    
    console.log("Updated phases:", updatedPhases.map(p => ({ name: p.name, status: p.status, order: p.order })));
    console.log("🎯 Phase reset completed! You can now test progression from Preliminaries → Semi-Finals");
    
  } catch (error) {
    console.error("❌ Error resetting phases:", error);
  }
}

// Run the script
resetToFirstPhase().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
