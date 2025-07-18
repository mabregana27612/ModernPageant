import { db } from "./db";
import { events, contestants, judges, scoringCriteria, phases, scores, users } from "@shared/schema";

async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Create sample users
    const userData = [
      { id: "judge1", email: "judge1@example.com", firstName: "Sarah", lastName: "Johnson", profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b494?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "judge2", email: "judge2@example.com", firstName: "Michael", lastName: "Chen", profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "judge3", email: "judge3@example.com", firstName: "Emma", lastName: "Williams", profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant1", email: "contestant1@example.com", firstName: "Isabella", lastName: "Rodriguez", profileImageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant2", email: "contestant2@example.com", firstName: "Sophia", lastName: "Taylor", profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant3", email: "contestant3@example.com", firstName: "Olivia", lastName: "Anderson", profileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant4", email: "contestant4@example.com", firstName: "Ava", lastName: "Martinez", profileImageUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant5", email: "contestant5@example.com", firstName: "Mia", lastName: "Brown", profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" }
    ];

    await db.insert(users).values(userData).onConflictDoNothing();

    // Create sample event
    const [event] = await db.insert(events).values({
      name: "Miss Beauty Contest 2025",
      description: "Annual beauty pageant featuring talent, interview, and evening gown competitions",
      startDate: new Date("2025-08-15T18:00:00Z"),
      endDate: new Date("2025-08-15T22:00:00Z"),
      status: "active",
      currentPhase: "finals"
    }).returning();

    // Create sample judges
    const judgeData = [
      { userId: "judge1", eventId: event.id, specialization: "Beauty Expert" },
      { userId: "judge2", eventId: event.id, specialization: "Talent Coordinator" },
      { userId: "judge3", eventId: event.id, specialization: "Fashion Consultant" }
    ];

    const createdJudges = await db.insert(judges).values(judgeData).returning();

    // Create sample contestants
    const contestantData = [
      { 
        userId: "contestant1", 
        eventId: event.id, 
        contestantNumber: "001", 
        status: "approved",
        bio: "Aspiring model and humanitarian with passion for community service",
        talent: "Classical Piano",
        achievements: "Miss Regional 2024, Scholarship Recipient"
      },
      { 
        userId: "contestant2", 
        eventId: event.id, 
        contestantNumber: "002", 
        status: "approved",
        bio: "Professional dancer and advocate for youth education",
        talent: "Contemporary Dance",
        achievements: "State Dance Champion, Youth Ambassador"
      },
      { 
        userId: "contestant3", 
        eventId: event.id, 
        contestantNumber: "003", 
        status: "approved",
        bio: "Environmental science student and sustainability advocate",
        talent: "Vocal Performance",
        achievements: "Environmental Award Winner, Dean's List"
      },
      { 
        userId: "contestant4", 
        eventId: event.id, 
        contestantNumber: "004", 
        status: "approved",
        bio: "Artist and social worker dedicated to helping underprivileged communities",
        talent: "Painting",
        achievements: "Community Service Award, Art Exhibition Winner"
      },
      { 
        userId: "contestant5", 
        eventId: event.id, 
        contestantNumber: "005", 
        status: "approved",
        bio: "Medical student with passion for healthcare accessibility",
        talent: "Violin",
        achievements: "Medical Honor Society, Volunteer of the Year"
      }
    ];

    const createdContestants = await db.insert(contestants).values(contestantData).returning();

    // Create sample phases
    const [phase] = await db.insert(phases).values({
      eventId: event.id,
      name: "Finals",
      description: "Final competition phase with all scoring criteria",
      status: "active",
      order: 1
    }).returning();

    // Create sample scoring criteria
    const criteriaData = [
      { eventId: event.id, name: "Interview", description: "Communication skills and personality", weight: 30, maxScore: 100 },
      { eventId: event.id, name: "Talent", description: "Individual talent performance", weight: 25, maxScore: 100 },
      { eventId: event.id, name: "Evening Gown", description: "Poise and elegance in formal wear", weight: 25, maxScore: 100 },
      { eventId: event.id, name: "Swimwear", description: "Confidence and fitness presentation", weight: 20, maxScore: 100 }
    ];

    const createdCriteria = await db.insert(scoringCriteria).values(criteriaData).returning();

    // Create sample scores
    const scoreData = [];
    
    // Scores for each contestant from each judge
    const contestantScores = [
      { // Contestant 1 - Winner
        interview: [88, 92, 89],
        talent: [85, 88, 90],
        eveningGown: [92, 89, 91],
        swimwear: [87, 85, 88]
      },
      { // Contestant 2 - Runner-up
        interview: [85, 87, 86],
        talent: [92, 89, 91],
        eveningGown: [88, 86, 87],
        swimwear: [84, 86, 85]
      },
      { // Contestant 3 - Third place
        interview: [82, 84, 83],
        talent: [86, 88, 87],
        eveningGown: [85, 87, 86],
        swimwear: [88, 85, 87]
      },
      { // Contestant 4
        interview: [79, 81, 80],
        talent: [83, 85, 84],
        eveningGown: [82, 84, 83],
        swimwear: [81, 83, 82]
      },
      { // Contestant 5
        interview: [77, 79, 78],
        talent: [81, 83, 82],
        eveningGown: [80, 82, 81],
        swimwear: [79, 81, 80]
      }
    ];

    for (let i = 0; i < createdContestants.length; i++) {
      const contestant = createdContestants[i];
      const scores = contestantScores[i];
      
      for (let j = 0; j < createdJudges.length; j++) {
        const judge = createdJudges[j];
        
        // Interview scores
        scoreData.push({
          eventId: event.id,
          phaseId: phase.id,
          contestantId: contestant.id,
          judgeId: judge.id,
          criteriaId: createdCriteria[0].id, // Interview
          score: scores.interview[j]
        });
        
        // Talent scores
        scoreData.push({
          eventId: event.id,
          phaseId: phase.id,
          contestantId: contestant.id,
          judgeId: judge.id,
          criteriaId: createdCriteria[1].id, // Talent
          score: scores.talent[j]
        });
        
        // Evening Gown scores
        scoreData.push({
          eventId: event.id,
          phaseId: phase.id,
          contestantId: contestant.id,
          judgeId: judge.id,
          criteriaId: createdCriteria[2].id, // Evening Gown
          score: scores.eveningGown[j]
        });
        
        // Swimwear scores
        scoreData.push({
          eventId: event.id,
          phaseId: phase.id,
          contestantId: contestant.id,
          judgeId: judge.id,
          criteriaId: createdCriteria[3].id, // Swimwear
          score: scores.swimwear[j]
        });
      }
    }

    await db.insert(scores).values(scoreData);

    console.log("Database seeded successfully!");
    console.log(`Created ${createdContestants.length} contestants`);
    console.log(`Created ${createdJudges.length} judges`);
    console.log(`Created ${createdCriteria.length} scoring criteria`);
    console.log(`Created ${scoreData.length} scores`);

  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();