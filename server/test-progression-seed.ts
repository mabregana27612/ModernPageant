
import { db } from "./db";
import { events, contestants, judges, shows, criteria, phases, scores, users, contestantPhases } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seedTestProgression() {
  try {
    console.log("Creating test data for phase progression...");

    // Clean up existing data first
    await db.delete(scores);
    await db.delete(contestantPhases);
    await db.delete(criteria);
    await db.delete(shows);
    await db.delete(phases);
    await db.delete(judges);
    await db.delete(contestants);
    await db.delete(events);
    await db.delete(users).where(sql`id LIKE 'test%'`);

    // Create test users
    const userData = [
      // Judges
      { id: "test-judge1", email: "judge1@test.com", firstName: "Sarah", lastName: "Johnson", role: "judge", profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b494?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "test-judge2", email: "judge2@test.com", firstName: "Michael", lastName: "Chen", role: "judge", profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "test-judge3", email: "judge3@test.com", firstName: "Emma", lastName: "Williams", role: "judge", profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      
      // Contestants (10 contestants to test progression)
      { id: "test-contestant1", email: "contestant1@test.com", firstName: "Isabella", lastName: "Rodriguez", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "test-contestant2", email: "contestant2@test.com", firstName: "Sophia", lastName: "Taylor", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "test-contestant3", email: "contestant3@test.com", firstName: "Olivia", lastName: "Anderson", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "test-contestant4", email: "contestant4@test.com", firstName: "Ava", lastName: "Martinez", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "test-contestant5", email: "contestant5@test.com", firstName: "Mia", lastName: "Brown", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "test-contestant6", email: "contestant6@test.com", firstName: "Charlotte", lastName: "Davis", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "test-contestant7", email: "contestant7@test.com", firstName: "Amelia", lastName: "Wilson", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "test-contestant8", email: "contestant8@test.com", firstName: "Harper", lastName: "Moore", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "test-contestant9", email: "contestant9@test.com", firstName: "Luna", lastName: "Garcia", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "test-contestant10", email: "contestant10@test.com", firstName: "Aria", lastName: "Thompson", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" }
    ];

    await db.insert(users).values(userData).onConflictDoNothing();

    // Create test event
    const [testEvent] = await db.insert(events).values({
      name: "Test Pageant 2025 - Phase Progression",
      description: "Test event for phase progression functionality",
      startDate: new Date("2025-08-20T18:00:00Z"),
      endDate: new Date("2025-08-20T22:00:00Z"),
      status: "active",
      currentPhase: "preliminaries"
    }).returning();

    // Create phases (3 phases for testing progression)
    const phaseData = [
      {
        eventId: testEvent.id,
        name: "Preliminaries",
        description: "Initial round with all contestants",
        order: 1,
        status: "active", // Start at first phase
        resetScores: false
      },
      {
        eventId: testEvent.id,
        name: "Semi-Finals",
        description: "Top 5 contestants advance",
        order: 2,
        status: "pending",
        resetScores: false
      },
      {
        eventId: testEvent.id,
        name: "Finals",
        description: "Top 3 contestants compete for the crown",
        order: 3,
        status: "pending",
        resetScores: true
      }
    ];

    const createdPhases = await db.insert(phases).values(phaseData).returning();
    const prelimsPhase = createdPhases.find(p => p.name === "Preliminaries");

    // Create contestants
    const contestantData = [
      { userId: "test-contestant1", eventId: testEvent.id, contestantNumber: 1, status: "approved", bio: "Psychology major", age: 22, location: "Miami, FL", occupation: "Student" },
      { userId: "test-contestant2", eventId: testEvent.id, contestantNumber: 2, status: "approved", bio: "Professional dancer", age: 24, location: "New York, NY", occupation: "Dancer" },
      { userId: "test-contestant3", eventId: testEvent.id, contestantNumber: 3, status: "approved", bio: "Environmental scientist", age: 23, location: "Portland, OR", occupation: "Scientist" },
      { userId: "test-contestant4", eventId: testEvent.id, contestantNumber: 4, status: "approved", bio: "Art therapist", age: 25, location: "Los Angeles, CA", occupation: "Therapist" },
      { userId: "test-contestant5", eventId: testEvent.id, contestantNumber: 5, status: "approved", bio: "Medical student", age: 26, location: "Houston, TX", occupation: "Student" },
      { userId: "test-contestant6", eventId: testEvent.id, contestantNumber: 6, status: "approved", bio: "Tech entrepreneur", age: 24, location: "San Francisco, CA", occupation: "Entrepreneur" },
      { userId: "test-contestant7", eventId: testEvent.id, contestantNumber: 7, status: "approved", bio: "Journalist", age: 23, location: "Chicago, IL", occupation: "Journalist" },
      { userId: "test-contestant8", eventId: testEvent.id, contestantNumber: 8, status: "approved", bio: "Professional athlete", age: 22, location: "Denver, CO", occupation: "Athlete" },
      { userId: "test-contestant9", eventId: testEvent.id, contestantNumber: 9, status: "approved", bio: "Social worker", age: 25, location: "Seattle, WA", occupation: "Social Worker" },
      { userId: "test-contestant10", eventId: testEvent.id, contestantNumber: 10, status: "approved", bio: "Teacher", age: 24, location: "Boston, MA", occupation: "Teacher" }
    ];

    const createdContestants = await db.insert(contestants).values(contestantData).returning();

    // Create judges
    const judgeData = [
      { userId: "test-judge1", eventId: testEvent.id, specialization: "Beauty & Fashion Expert" },
      { userId: "test-judge2", eventId: testEvent.id, specialization: "Talent & Performance Director" },
      { userId: "test-judge3", eventId: testEvent.id, specialization: "Interview & Communication Coach" }
    ];

    const createdJudges = await db.insert(judges).values(judgeData).returning();

    // Create shows for Preliminaries phase only
    const showsData = [
      { eventId: testEvent.id, phaseId: prelimsPhase!.id, name: "Interview", description: "Personal interview and Q&A session", weight: "30.00", order: 1 },
      { eventId: testEvent.id, phaseId: prelimsPhase!.id, name: "Talent", description: "Individual talent performance", weight: "25.00", order: 2 },
      { eventId: testEvent.id, phaseId: prelimsPhase!.id, name: "Evening Gown", description: "Elegance and poise in formal wear", weight: "25.00", order: 3 },
      { eventId: testEvent.id, phaseId: prelimsPhase!.id, name: "Swimwear", description: "Confidence and fitness presentation", weight: "20.00", order: 4 }
    ];

    const createdShows = await db.insert(shows).values(showsData).returning();

    // Create criteria for each show
    const criteriaData = [
      // Interview criteria
      { showId: createdShows[0].id, name: "Communication Skills", description: "Clarity and articulation", weight: "35.00", maxScore: 10 },
      { showId: createdShows[0].id, name: "Intelligence", description: "Knowledge and thoughtfulness", weight: "30.00", maxScore: 10 },
      { showId: createdShows[0].id, name: "Confidence", description: "Poise and self-assurance", weight: "25.00", maxScore: 10 },
      { showId: createdShows[0].id, name: "Personality", description: "Charisma and likability", weight: "10.00", maxScore: 10 },

      // Talent criteria
      { showId: createdShows[1].id, name: "Skill Level", description: "Technical proficiency", weight: "40.00", maxScore: 10 },
      { showId: createdShows[1].id, name: "Stage Presence", description: "Command of the stage", weight: "30.00", maxScore: 10 },
      { showId: createdShows[1].id, name: "Creativity", description: "Originality and innovation", weight: "20.00", maxScore: 10 },
      { showId: createdShows[1].id, name: "Entertainment Value", description: "Overall performance quality", weight: "10.00", maxScore: 10 },

      // Evening Gown criteria
      { showId: createdShows[2].id, name: "Elegance", description: "Grace and sophistication", weight: "35.00", maxScore: 10 },
      { showId: createdShows[2].id, name: "Poise", description: "Confident posture and walk", weight: "30.00", maxScore: 10 },
      { showId: createdShows[2].id, name: "Gown Selection", description: "Appropriate choice and fit", weight: "25.00", maxScore: 10 },
      { showId: createdShows[2].id, name: "Overall Presentation", description: "Complete package", weight: "10.00", maxScore: 10 },

      // Swimwear criteria
      { showId: createdShows[3].id, name: "Physical Fitness", description: "Health and conditioning", weight: "40.00", maxScore: 10 },
      { showId: createdShows[3].id, name: "Confidence", description: "Self-assurance and comfort", weight: "30.00", maxScore: 10 },
      { showId: createdShows[3].id, name: "Stage Presence", description: "Command and charisma", weight: "20.00", maxScore: 10 },
      { showId: createdShows[3].id, name: "Overall Appeal", description: "Complete presentation", weight: "10.00", maxScore: 10 }
    ];

    const createdCriteria = await db.insert(criteria).values(criteriaData).returning();

    // Add all contestants to the first phase (Preliminaries)
    const contestantPhaseData = createdContestants.map((contestant, index) => ({
      contestantId: contestant.id,
      phaseId: prelimsPhase!.id,
      status: "active" as const,
      rank: index + 1
    }));

    await db.insert(contestantPhases).values(contestantPhaseData);

    // Create varied scores for Preliminaries phase only
    const scoreData = [];
    
    // Score ranges for different performance levels
    const scoreRanges = [
      { min: 8.5, max: 9.5 }, // Top performers
      { min: 8.0, max: 9.0 }, // Good performers
      { min: 7.5, max: 8.5 }, // Average performers
      { min: 7.0, max: 8.0 }, // Below average performers
    ];

    for (let i = 0; i < createdContestants.length; i++) {
      const contestant = createdContestants[i];
      const rangeIndex = Math.floor(i / 3) % scoreRanges.length;
      const range = scoreRanges[rangeIndex];

      for (const judge of createdJudges) {
        for (const criterion of createdCriteria) {
          const score = range.min + Math.random() * (range.max - range.min);
          scoreData.push({
            eventId: testEvent.id,
            phaseId: prelimsPhase!.id,
            contestantId: contestant.id,
            judgeId: judge.id,
            showId: criterion.showId,
            criteriaId: criterion.id,
            score: score.toFixed(2)
          });
        }
      }
    }

    await db.insert(scores).values(scoreData);

    console.log("✅ Test progression seeding completed!");
    console.log(`Created test event: ${testEvent.name}`);
    console.log(`Created ${createdContestants.length} contestants`);
    console.log(`Created ${createdJudges.length} judges`);
    console.log(`Created ${createdPhases.length} phases (currently at: ${prelimsPhase?.name})`);
    console.log(`Created ${createdShows.length} shows for Preliminaries`);
    console.log(`Created ${createdCriteria.length} criteria`);
    console.log(`Created ${scoreData.length} scores for Preliminaries phase`);
    console.log(`\n🎯 Ready to test phase progression!`);
    console.log(`📊 All contestants are currently in the Preliminaries phase`);
    console.log(`🔄 Use Admin Panel > Phase Progression to advance contestants to Semi-Finals`);

  } catch (error) {
    console.error("❌ Error seeding test progression data:", error);
  }
}

// Run the script
seedTestProgression().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});
