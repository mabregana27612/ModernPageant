import { db } from "./db";
import { events, contestants, judges, shows, criteria, phases, scores, users } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seedDatabase() {
  try {
    console.log("Seeding database with sample pageant data...");

    // Clean up existing data in correct order to avoid foreign key constraints
    await db.delete(scores);
    await db.delete(criteria);
    await db.delete(shows);
    await db.delete(phases);
    await db.delete(judges);
    await db.delete(contestants);
    await db.delete(events);
    await db.delete(users).where(sql`id LIKE 'judge%' OR id LIKE 'contestant%' OR id LIKE 'admin%'`);

    console.log("Creating sample users...");
    // Create sample users
    const userData = [
      // Admin user
      { id: "admin1", email: "admin@pageant.com", firstName: "Jessica", lastName: "Martinez", role: "admin", profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b494?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      
      // Judge users
      { id: "judge1", email: "sarah.johnson@judges.com", firstName: "Sarah", lastName: "Johnson", role: "judge", profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b494?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "judge2", email: "michael.chen@judges.com", firstName: "Michael", lastName: "Chen", role: "judge", profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "judge3", email: "emma.williams@judges.com", firstName: "Emma", lastName: "Williams", role: "judge", profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      
      // Contestant users
      { id: "contestant1", email: "isabella.rodriguez@contestants.com", firstName: "Isabella", lastName: "Rodriguez", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant2", email: "sophia.taylor@contestants.com", firstName: "Sophia", lastName: "Taylor", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant3", email: "olivia.anderson@contestants.com", firstName: "Olivia", lastName: "Anderson", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant4", email: "ava.martinez@contestants.com", firstName: "Ava", lastName: "Martinez", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant5", email: "mia.brown@contestants.com", firstName: "Mia", lastName: "Brown", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" }
    ];

    await db.insert(users).values(userData).onConflictDoNothing();

    console.log("Creating event...");
    // Create event
    const [event] = await db.insert(events).values({
      name: "Miss Universe 2025",
      description: "The most prestigious beauty pageant featuring contestants from around the world",
      startDate: new Date("2025-08-15T18:00:00Z"),
      endDate: new Date("2025-08-15T22:00:00Z"),
      status: "active",
      currentPhase: "interview"
    }).returning();

    console.log("Creating phases...");
    // Create phases first (required for shows)
    const phaseData = [
      { eventId: event.id, name: "Preliminaries", description: "Initial round of competition", order: 1, status: "active", resetScores: false },
      { eventId: event.id, name: "Semi-Finals", description: "Semi-final round", order: 2, status: "pending", resetScores: true },
      { eventId: event.id, name: "Finals", description: "Final round", order: 3, status: "pending", resetScores: true }
    ];

    const createdPhases = await db.insert(phases).values(phaseData).returning();

    console.log("Creating judges...");
    // Create judges
    const judgeData = [
      { userId: "judge1", eventId: event.id, specialization: "Beauty Expert" },
      { userId: "judge2", eventId: event.id, specialization: "Talent Coordinator" },
      { userId: "judge3", eventId: event.id, specialization: "Fashion Consultant" }
    ];

    await db.insert(judges).values(judgeData).returning();

    console.log("Creating contestants...");
    // Create contestants
    const contestantData = [
      { userId: "contestant1", eventId: event.id, contestantNumber: 1, status: "active", bio: "Psychology major with a passion for mental health advocacy", age: 22, location: "Miami, Florida", occupation: "University Student" },
      { userId: "contestant2", eventId: event.id, contestantNumber: 2, status: "active", bio: "Professional dancer and choreographer", age: 24, location: "New York, New York", occupation: "Dance Instructor" },
      { userId: "contestant3", eventId: event.id, contestantNumber: 3, status: "active", bio: "Environmental science graduate", age: 23, location: "Portland, Oregon", occupation: "Environmental Scientist" },
      { userId: "contestant4", eventId: event.id, contestantNumber: 4, status: "active", bio: "Artist and social worker", age: 25, location: "Los Angeles, California", occupation: "Art Therapist" },
      { userId: "contestant5", eventId: event.id, contestantNumber: 5, status: "active", bio: "Medical student specializing in pediatric care", age: 26, location: "Houston, Texas", occupation: "Medical Student" }
    ];

    await db.insert(contestants).values(contestantData).returning();

    console.log("Creating shows and criteria...");
    // Create shows for the first phase
    const prelimPhase = createdPhases[0];
    
    const showData = [
      { eventId: event.id, phaseId: prelimPhase.id, name: "Interview", description: "Personal interview and Q&A session", weight: "30.00", order: 1, icon: "MessageCircle" },
      { eventId: event.id, phaseId: prelimPhase.id, name: "Talent", description: "Individual talent performance", weight: "25.00", order: 2, icon: "Music" },
      { eventId: event.id, phaseId: prelimPhase.id, name: "Evening Gown", description: "Evening gown presentation", weight: "25.00", order: 3, icon: "Sparkles" },
      { eventId: event.id, phaseId: prelimPhase.id, name: "Swimwear", description: "Swimwear competition", weight: "20.00", order: 4, icon: "Sun" }
    ];

    const createdShows = await db.insert(shows).values(showData).returning();

    // Create criteria for each show
    for (const show of createdShows) {
      const criteriaData = [
        { showId: show.id, name: "Poise & Confidence", description: "Confidence and stage presence", weight: "40.00", order: 1, maxScore: 10 },
        { showId: show.id, name: "Presentation", description: "Overall presentation quality", weight: "35.00", order: 2, maxScore: 10 },
        { showId: show.id, name: "Technique", description: "Technical skill and execution", weight: "25.00", order: 3, maxScore: 10 }
      ];

      await db.insert(criteria).values(criteriaData);
    }

    console.log("✅ Database seeded successfully!");
    console.log(`Created event: ${event.name}`);
    console.log(`Created ${userData.length} users`);
    console.log(`Created ${phaseData.length} phases`);
    console.log(`Created ${contestantData.length} contestants`);
    console.log(`Created ${judgeData.length} judges`);
    console.log(`Created ${showData.length} shows with criteria`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase().then(() => {
  console.log("Seeding completed!");
  process.exit(0);
});