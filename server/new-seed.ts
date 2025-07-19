import { db } from "./db";
import { events, contestants, judges, shows, criteria, phases, scores, users } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seedNewStructure() {
  try {
    console.log("Creating data with new Shows/Criteria structure...");

    // Clean up existing data first
    await db.delete(scores);
    await db.delete(phases);
    await db.delete(criteria);
    await db.delete(shows);
    await db.delete(judges);
    await db.delete(contestants);
    await db.delete(events);
    await db.delete(users).where(sql`id LIKE 'judge%' OR id LIKE 'contestant%' OR id LIKE 'admin%'`);

    // Create sample users
    const userData = [
      // Judges
      { id: "judge1", email: "sarah.johnson@judges.com", firstName: "Sarah", lastName: "Johnson", role: "judge", profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b494?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "judge2", email: "michael.chen@judges.com", firstName: "Michael", lastName: "Chen", role: "judge", profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "judge3", email: "emma.williams@judges.com", firstName: "Emma", lastName: "Williams", role: "judge", profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      
      // Contestants
      { id: "contestant1", email: "isabella.rodriguez@contestants.com", firstName: "Isabella", lastName: "Rodriguez", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant2", email: "sophia.taylor@contestants.com", firstName: "Sophia", lastName: "Taylor", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant3", email: "olivia.anderson@contestants.com", firstName: "Olivia", lastName: "Anderson", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant4", email: "ava.martinez@contestants.com", firstName: "Ava", lastName: "Martinez", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant5", email: "mia.brown@contestants.com", firstName: "Mia", lastName: "Brown", role: "contestant", profileImageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" }
    ];

    await db.insert(users).values(userData).onConflictDoNothing();

    // Create event
    const [event] = await db.insert(events).values({
      name: "Miss Universe 2025",
      description: "The most prestigious beauty pageant featuring contestants from around the world",
      startDate: new Date("2025-08-15T18:00:00Z"),
      endDate: new Date("2025-08-15T22:00:00Z"),
      status: "active",
      currentPhase: "interview"
    }).returning();

    // Create contestants
    const contestantData = [
      { userId: "contestant1", eventId: event.id, contestantNumber: 1, status: "active", bio: "Psychology major with a passion for mental health advocacy", age: 22, location: "Miami, Florida", occupation: "University Student" },
      { userId: "contestant2", eventId: event.id, contestantNumber: 2, status: "active", bio: "Professional dancer and choreographer", age: 24, location: "New York, New York", occupation: "Dance Instructor" },
      { userId: "contestant3", eventId: event.id, contestantNumber: 3, status: "active", bio: "Environmental science graduate", age: 23, location: "Portland, Oregon", occupation: "Environmental Scientist" },
      { userId: "contestant4", eventId: event.id, contestantNumber: 4, status: "active", bio: "Artist and social worker", age: 25, location: "Los Angeles, California", occupation: "Art Therapist" },
      { userId: "contestant5", eventId: event.id, contestantNumber: 5, status: "active", bio: "Medical student specializing in pediatric care", age: 26, location: "Houston, Texas", occupation: "Medical Student" }
    ];

    const createdContestants = await db.insert(contestants).values(contestantData).returning();

    // Create judges
    const judgeData = [
      { userId: "judge1", eventId: event.id, specialization: "Beauty & Fashion Expert" },
      { userId: "judge2", eventId: event.id, specialization: "Talent & Performance Director" },
      { userId: "judge3", eventId: event.id, specialization: "Interview & Communication Coach" }
    ];

    const createdJudges = await db.insert(judges).values(judgeData).returning();

    // Create shows (main categories)
    const showData = [
      { eventId: event.id, name: "Interview", description: "Personal interview and Q&A session", weight: 30, order: 1, icon: "MessageCircle" },
      { eventId: event.id, name: "Talent", description: "Individual talent performance", weight: 25, order: 2, icon: "Star" },
      { eventId: event.id, name: "Evening Gown", description: "Elegance and poise in formal wear", weight: 25, order: 3, icon: "Shirt" },
      { eventId: event.id, name: "Swimwear", description: "Confidence and fitness presentation", weight: 20, order: 4, icon: "Waves" }
    ];

    const createdShows = await db.insert(shows).values(showData).returning();

    // Create phases (automatically generated from shows)
    const phaseData = createdShows.map((show, index) => ({
      eventId: event.id,
      showId: show.id,
      name: show.name,
      order: show.order,
      status: index === 0 ? "active" : "pending" as const,
      resetScores: false
    }));

    const createdPhases = await db.insert(phases).values(phaseData).returning();

    // Create criteria for each show
    const criteriaData = [
      // Interview criteria
      { showId: createdShows[0].id, name: "Communication Skills", description: "Clarity and articulation", weight: 30, maxScore: 10 },
      { showId: createdShows[0].id, name: "Intelligence", description: "Knowledge and thoughtfulness", weight: 30, maxScore: 10 },
      { showId: createdShows[0].id, name: "Confidence", description: "Poise and self-assurance", weight: 25, maxScore: 10 },
      { showId: createdShows[0].id, name: "Personality", description: "Charisma and likability", weight: 15, maxScore: 10 },
      
      // Talent criteria
      { showId: createdShows[1].id, name: "Skill Level", description: "Technical proficiency", weight: 40, maxScore: 10 },
      { showId: createdShows[1].id, name: "Stage Presence", description: "Command of the stage", weight: 30, maxScore: 10 },
      { showId: createdShows[1].id, name: "Creativity", description: "Originality and innovation", weight: 20, maxScore: 10 },
      { showId: createdShows[1].id, name: "Entertainment Value", description: "Overall performance quality", weight: 10, maxScore: 10 },
      
      // Evening Gown criteria
      { showId: createdShows[2].id, name: "Elegance", description: "Grace and sophistication", weight: 35, maxScore: 10 },
      { showId: createdShows[2].id, name: "Poise", description: "Confident posture and walk", weight: 30, maxScore: 10 },
      { showId: createdShows[2].id, name: "Gown Selection", description: "Appropriate choice and fit", weight: 25, maxScore: 10 },
      { showId: createdShows[2].id, name: "Overall Presentation", description: "Complete package", weight: 10, maxScore: 10 },
      
      // Swimwear criteria
      { showId: createdShows[3].id, name: "Physical Fitness", description: "Health and conditioning", weight: 40, maxScore: 10 },
      { showId: createdShows[3].id, name: "Confidence", description: "Self-assurance and comfort", weight: 30, maxScore: 10 },
      { showId: createdShows[3].id, name: "Stage Presence", description: "Command and charisma", weight: 20, maxScore: 10 },
      { showId: createdShows[3].id, name: "Overall Appeal", description: "Complete presentation", weight: 10, maxScore: 10 }
    ];

    const createdCriteria = await db.insert(criteria).values(criteriaData).returning();

    // Create some sample scores for the active phase (Interview)
    const activePhase = createdPhases.find(p => p.status === "active");
    const interviewCriteria = createdCriteria.filter(c => c.showId === createdShows[0].id);
    
    if (activePhase) {
      const scoreData = [];
      
      // Create scores for each contestant from each judge for interview criteria
      for (const contestant of createdContestants) {
        for (const judge of createdJudges) {
          for (const criterion of interviewCriteria) {
            // Generate realistic scores between 7-10
            const score = Math.floor(Math.random() * 4) + 7 + Math.random();
            scoreData.push({
              eventId: event.id,
              contestantId: contestant.id,
              judgeId: judge.id,
              showId: createdShows[0].id,
              criteriaId: criterion.id,
              phaseId: activePhase.id,
              score: parseFloat(score.toFixed(2))
            });
          }
        }
      }
      
      await db.insert(scores).values(scoreData);
    }

    console.log("✅ New structure seeding completed!");
    console.log(`Created 1 event: ${event.name}`);
    console.log(`Created ${createdContestants.length} contestants`);
    console.log(`Created ${createdJudges.length} judges`);
    console.log(`Created ${createdShows.length} shows`);
    console.log(`Created ${createdPhases.length} phases`);
    console.log(`Created ${createdCriteria.length} criteria`);
    console.log(`Active Phase: ${activePhase?.name} - judges can score contestants now!`);

  } catch (error) {
    console.error("❌ Error seeding new structure:", error);
  }
}

seedNewStructure();