
import { db } from "./db";
import { events, contestants, judges, shows, criteria, phases, scores, users, contestantPhases } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seedComprehensiveData() {
  try {
    console.log("Creating comprehensive sample data...");

    // Clear existing data in correct order to avoid foreign key constraints
    await db.delete(scores);
    await db.delete(contestantPhases);
    await db.delete(criteria);
    await db.delete(shows);
    await db.delete(phases);
    await db.delete(judges);
    await db.delete(contestants);
    await db.delete(events);
    await db.delete(users).where(sql`id LIKE 'judge%' OR id LIKE 'contestant%' OR id LIKE 'admin%'`);

    // Create sample users (judges, contestants, admins)
    const userData = [
      // Admin users
      { id: "admin1", email: "admin@pageant.com", firstName: "Jessica", lastName: "Martinez", profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b494?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },

      // Judge users  
      { id: "judge1", email: "sarah.johnson@judges.com", firstName: "Sarah", lastName: "Johnson", profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b494?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "judge2", email: "michael.chen@judges.com", firstName: "Michael", lastName: "Chen", profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "judge3", email: "emma.williams@judges.com", firstName: "Emma", lastName: "Williams", profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "judge4", email: "david.brown@judges.com", firstName: "David", lastName: "Brown", profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "judge5", email: "lisa.garcia@judges.com", firstName: "Lisa", lastName: "Garcia", profileImageUrl: "https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },

      // Contestant users
      { id: "contestant1", email: "isabella.rodriguez@contestants.com", firstName: "Isabella", lastName: "Rodriguez", profileImageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant2", email: "sophia.taylor@contestants.com", firstName: "Sophia", lastName: "Taylor", profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant3", email: "olivia.anderson@contestants.com", firstName: "Olivia", lastName: "Anderson", profileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant4", email: "ava.martinez@contestants.com", firstName: "Ava", lastName: "Martinez", profileImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant5", email: "mia.brown@contestants.com", firstName: "Mia", lastName: "Brown", profileImageUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant6", email: "charlotte.davis@contestants.com", firstName: "Charlotte", lastName: "Davis", profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant7", email: "amelia.wilson@contestants.com", firstName: "Amelia", lastName: "Wilson", profileImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant8", email: "harper.moore@contestants.com", firstName: "Harper", lastName: "Moore", profileImageUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" }
    ];

    await db.insert(users).values(userData).onConflictDoNothing();

    // Create main event
    const eventData = {
      name: "Miss Universe 2025",
      description: "The most prestigious beauty pageant featuring contestants from around the world",
      startDate: new Date("2025-08-15T18:00:00Z"),
      endDate: new Date("2025-08-15T22:00:00Z"),
      status: "active",
      currentPhase: "finals"
    };

    const [activeEvent] = await db.insert(events).values(eventData).returning();

    // Create judges for the active event
    const judgeData = [
      { userId: "judge1", eventId: activeEvent.id, specialization: "Beauty & Fashion Expert" },
      { userId: "judge2", eventId: activeEvent.id, specialization: "Talent & Performance Director" },
      { userId: "judge3", eventId: activeEvent.id, specialization: "Interview & Communication Coach" },
      { userId: "judge4", eventId: activeEvent.id, specialization: "Runway & Presentation Specialist" },
      { userId: "judge5", eventId: activeEvent.id, specialization: "Pageant Industry Veteran" }
    ];

    const createdJudges = await db.insert(judges).values(judgeData).returning();

    // Create contestants for the active event
    const contestantData = [
      { 
        userId: "contestant1", 
        eventId: activeEvent.id, 
        contestantNumber: 1,
        status: "approved",
        bio: "Psychology major with a passion for mental health advocacy. Fluent in Spanish and English.",
        age: 22,
        location: "Miami, Florida",
        occupation: "University Student & Mental Health Advocate"
      },
      { 
        userId: "contestant2", 
        eventId: activeEvent.id, 
        contestantNumber: 2,
        status: "approved",
        bio: "Professional dancer and choreographer dedicated to youth education and empowerment.",
        age: 24,
        location: "New York, New York",
        occupation: "Dance Instructor & Choreographer"
      },
      { 
        userId: "contestant3", 
        eventId: activeEvent.id, 
        contestantNumber: 3,
        status: "approved",
        bio: "Environmental science graduate working on sustainable living initiatives.",
        age: 23,
        location: "Portland, Oregon",
        occupation: "Environmental Scientist"
      },
      { 
        userId: "contestant4", 
        eventId: activeEvent.id, 
        contestantNumber: 4,
        status: "approved",
        bio: "Artist and social worker helping underprivileged communities through art therapy.",
        age: 25,
        location: "Los Angeles, California",
        occupation: "Art Therapist & Social Worker"
      },
      { 
        userId: "contestant5", 
        eventId: activeEvent.id, 
        contestantNumber: 5,
        status: "approved",
        bio: "Medical student specializing in pediatric care with volunteer work in rural communities.",
        age: 26,
        location: "Houston, Texas",
        occupation: "Medical Student"
      },
      { 
        userId: "contestant6", 
        eventId: activeEvent.id, 
        contestantNumber: 6,
        status: "approved",
        bio: "Technology entrepreneur developing apps for educational accessibility.",
        age: 24,
        location: "San Francisco, California",
        occupation: "Tech Entrepreneur"
      },
      { 
        userId: "contestant7", 
        eventId: activeEvent.id, 
        contestantNumber: 7,
        status: "approved",
        bio: "Journalism graduate reporting on social justice issues and human rights.",
        age: 23,
        location: "Chicago, Illinois",
        occupation: "Journalist & Human Rights Advocate"
      },
      { 
        userId: "contestant8", 
        eventId: activeEvent.id, 
        contestantNumber: 8,
        status: "approved",
        bio: "Professional athlete and fitness coach promoting healthy lifestyle choices.",
        age: 22,
        location: "Denver, Colorado",
        occupation: "Professional Athlete & Fitness Coach"
      }
    ];

    const createdContestants = await db.insert(contestants).values(contestantData).returning();

    // Create phases FIRST (before shows, since shows reference phases)
    const phaseData = [
      {
        eventId: activeEvent.id,
        name: "Preliminaries",
        description: "Initial judging round with all contestants",
        order: 1,
        status: "completed",
        resetScores: false
      },
      {
        eventId: activeEvent.id,
        name: "Semi-Finals",
        description: "Semi-final competition round",
        order: 2,
        status: "completed",
        resetScores: false
      },
      {
        eventId: activeEvent.id,
        name: "Finals",
        description: "Final competition round",
        order: 3,
        status: "active",
        resetScores: true
      }
    ];

    const createdPhases = await db.insert(phases).values(phaseData).returning();
    const finalsPhase = createdPhases.find(p => p.name === "Finals" && p.status === "active");

    // Create shows (main competition categories) - NOW that phases exist
    const showsData = [
      { eventId: activeEvent.id, phaseId: finalsPhase!.id, name: "Interview", description: "Communication skills, intelligence, and personality", weight: "30.00", order: 1 },
      { eventId: activeEvent.id, phaseId: finalsPhase!.id, name: "Talent", description: "Individual talent performance and stage presence", weight: "25.00", order: 2 },
      { eventId: activeEvent.id, phaseId: finalsPhase!.id, name: "Evening Gown", description: "Poise, elegance, and grace in formal wear", weight: "25.00", order: 3 },
      { eventId: activeEvent.id, phaseId: finalsPhase!.id, name: "Swimwear", description: "Confidence, fitness, and stage presence", weight: "20.00", order: 4 }
    ];

    const createdShows = await db.insert(shows).values(showsData).returning();

    // Create criteria for each show
    const criteriaData = [
      // Interview criteria
      { showId: createdShows[0].id, name: "Communication Skills", description: "Clarity, articulation, and verbal expression", weight: "35.00", maxScore: 10 },
      { showId: createdShows[0].id, name: "Intelligence & Knowledge", description: "General knowledge and intellectual capacity", weight: "30.00", maxScore: 10 },
      { showId: createdShows[0].id, name: "Confidence & Poise", description: "Self-assurance and composure under pressure", weight: "25.00", maxScore: 10 },
      { showId: createdShows[0].id, name: "Personality & Charisma", description: "Natural charm and likability", weight: "10.00", maxScore: 10 },

      // Talent criteria
      { showId: createdShows[1].id, name: "Skill Level", description: "Technical proficiency and mastery", weight: "40.00", maxScore: 10 },
      { showId: createdShows[1].id, name: "Stage Presence", description: "Commanding attention and engagement", weight: "30.00", maxScore: 10 },
      { showId: createdShows[1].id, name: "Creativity & Originality", description: "Uniqueness and creative expression", weight: "20.00", maxScore: 10 },
      { showId: createdShows[1].id, name: "Overall Performance", description: "Entertainment value and execution", weight: "10.00", maxScore: 10 },

      // Evening Gown criteria
      { showId: createdShows[2].id, name: "Elegance & Grace", description: "Sophisticated movement and bearing", weight: "35.00", maxScore: 10 },
      { showId: createdShows[2].id, name: "Poise & Posture", description: "Confident stance and walk", weight: "30.00", maxScore: 10 },
      { showId: createdShows[2].id, name: "Gown Selection", description: "Appropriate choice and fit", weight: "25.00", maxScore: 10 },
      { showId: createdShows[2].id, name: "Overall Presentation", description: "Complete package and impression", weight: "10.00", maxScore: 10 },

      // Swimwear criteria
      { showId: createdShows[3].id, name: "Physical Fitness", description: "Health and conditioning", weight: "40.00", maxScore: 10 },
      { showId: createdShows[3].id, name: "Confidence", description: "Self-assurance and comfort", weight: "30.00", maxScore: 10 },
      { showId: createdShows[3].id, name: "Stage Presence", description: "Commanding the stage", weight: "20.00", maxScore: 10 },
      { showId: createdShows[3].id, name: "Overall Impression", description: "Complete presentation", weight: "10.00", maxScore: 10 },
    ];

    const createdCriteria = await db.insert(criteria).values(criteriaData).returning();

    // Create realistic scoring data for finals phase
    const scoreData = [];

    // Realistic score ranges for each contestant (top 8 finalists)
    const finalistScores = [
      { // Contestant 1 - Winner (Isabella Rodriguez)
        interview: [9.2, 9.4, 9.1, 9.3, 9.0],
        talent: [8.8, 9.0, 8.9, 8.7, 9.1],
        eveningGown: [9.5, 9.2, 9.4, 9.6, 9.3],
        swimwear: [8.9, 9.1, 8.8, 9.0, 8.7]
      },
      { // Contestant 2 - Runner-up (Sophia Taylor)
        interview: [8.9, 9.1, 8.7, 9.0, 8.8],
        talent: [9.5, 9.3, 9.6, 9.4, 9.2],
        eveningGown: [9.0, 8.9, 9.1, 8.8, 9.0],
        swimwear: [8.7, 8.9, 8.6, 8.8, 8.5]
      },
      { // Contestant 3 - Third place (Olivia Anderson)
        interview: [8.5, 8.7, 8.9, 8.6, 8.8],
        talent: [9.0, 8.8, 9.1, 8.9, 8.7],
        eveningGown: [8.8, 9.0, 8.7, 8.9, 8.6],
        swimwear: [9.0, 8.8, 8.9, 8.7, 9.1]
      },
      { // Contestant 4 - Fourth place (Ava Martinez)
        interview: [8.3, 8.5, 8.4, 8.6, 8.2],
        talent: [8.7, 8.9, 8.5, 8.8, 8.6],
        eveningGown: [8.5, 8.7, 8.6, 8.4, 8.8],
        swimwear: [8.4, 8.6, 8.3, 8.5, 8.7]
      },
      { // Contestant 5 - Fifth place (Mia Brown)
        interview: [8.1, 8.3, 8.5, 8.2, 8.4],
        talent: [8.4, 8.6, 8.2, 8.5, 8.3],
        eveningGown: [8.3, 8.5, 8.4, 8.2, 8.6],
        swimwear: [8.2, 8.4, 8.1, 8.3, 8.5]
      },
      { // Contestant 6
        interview: [7.9, 8.1, 8.0, 8.2, 7.8],
        talent: [8.2, 8.4, 8.0, 8.3, 8.1],
        eveningGown: [8.1, 8.3, 8.2, 8.0, 8.4],
        swimwear: [8.0, 8.2, 7.9, 8.1, 8.3]
      },
      { // Contestant 7
        interview: [7.7, 7.9, 7.8, 8.0, 7.6],
        talent: [8.0, 8.2, 7.8, 8.1, 7.9],
        eveningGown: [7.9, 8.1, 8.0, 7.8, 8.2],
        swimwear: [7.8, 8.0, 7.7, 7.9, 8.1]
      },
      { // Contestant 8
        interview: [7.5, 7.7, 7.6, 7.8, 7.4],
        talent: [7.8, 8.0, 7.6, 7.9, 7.7],
        eveningGown: [7.7, 7.9, 7.8, 7.6, 8.0],
        swimwear: [7.6, 7.8, 7.5, 7.7, 7.9]
      }
    ];

    // Create scores for all contestants in finals phase
    if (finalsPhase) {
      for (let i = 0; i < createdContestants.length; i++) {
        const contestant = createdContestants[i];
        const scores = finalistScores[i];

        for (let j = 0; j < createdJudges.length; j++) {
          const judge = createdJudges[j];

          // Interview scores (first 4 criteria belong to Interview show)
          for (let k = 0; k < 4; k++) {
            scoreData.push({
              eventId: activeEvent.id,
              phaseId: finalsPhase.id,
              contestantId: contestant.id,
              judgeId: judge.id,
              showId: createdShows[0].id,
              criteriaId: createdCriteria[k].id,
              score: scores.interview[j].toString()
            });
          }

          // Talent scores (next 4 criteria belong to Talent show)
          for (let k = 4; k < 8; k++) {
            scoreData.push({
              eventId: activeEvent.id,
              phaseId: finalsPhase.id,
              contestantId: contestant.id,
              judgeId: judge.id,
              showId: createdShows[1].id,
              criteriaId: createdCriteria[k].id,
              score: scores.talent[j].toString()
            });
          }

          // Evening Gown scores (next 4 criteria belong to Evening Gown show)
          for (let k = 8; k < 12; k++) {
            scoreData.push({
              eventId: activeEvent.id,
              phaseId: finalsPhase.id,
              contestantId: contestant.id,
              judgeId: judge.id,
              showId: createdShows[2].id,
              criteriaId: createdCriteria[k].id,
              score: scores.eveningGown[j].toString()
            });
          }

          // Swimwear scores (last 4 criteria belong to Swimwear show)
          for (let k = 12; k < 16; k++) {
            scoreData.push({
              eventId: activeEvent.id,
              phaseId: finalsPhase.id,
              contestantId: contestant.id,
              judgeId: judge.id,
              showId: createdShows[3].id,
              criteriaId: createdCriteria[k].id,
              score: scores.swimwear[j].toString()
            });
          }
        }
      }

      await db.insert(scores).values(scoreData);
    }

    console.log("✅ Comprehensive database seeding completed!");
    console.log(`Created 1 event: ${activeEvent.name}`);
    console.log(`Created ${createdContestants.length} contestants`);
    console.log(`Created ${createdJudges.length} judges`);
    console.log(`Created ${createdShows.length} shows and ${createdCriteria.length} criteria`);
    console.log(`Created ${createdPhases.length} phases`);
    console.log(`Created ${scoreData.length} scores`);
    console.log(`\n🎯 Active Event: ${activeEvent.name}`);
    console.log(`📊 Finals Phase: ${finalsPhase ? finalsPhase.name + ' (with complete scoring)' : 'No active finals phase'}`);
    console.log(`👑 Ready for testing: scoring, results, and rankings`);

  } catch (error) {
    console.error("❌ Error seeding comprehensive data:", error);
  }
}

seedComprehensiveData();
