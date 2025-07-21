import { db } from "./db";
import { events, contestants, judges, shows, criteria, phases, scores, users } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seedComprehensiveData() {
  try {
    console.log("Creating comprehensive sample data...");

    // Clean up existing data
    await db.delete(scores);
    await db.delete(judges);
    await db.delete(contestants);
    await db.delete(criteria);
    await db.delete(phases);
    await db.delete(shows);
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
      { id: "contestant8", email: "harper.moore@contestants.com", firstName: "Harper", lastName: "Moore", profileImageUrl: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant9", email: "evelyn.taylor@contestants.com", firstName: "Evelyn", lastName: "Taylor", profileImageUrl: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" },
      { id: "contestant10", email: "abigail.anderson@contestants.com", firstName: "Abigail", lastName: "Anderson", profileImageUrl: "https://images.unsplash.com/photo-1581403341630-a6e0b9d2d257?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" }
    ];

    await db.insert(users).values(userData).onConflictDoNothing();

    // Create multiple events
    const eventData = [
      {
        name: "Miss Universe 2025",
        description: "The most prestigious beauty pageant featuring contestants from around the world",
        startDate: new Date("2025-08-15T18:00:00Z"),
        endDate: new Date("2025-08-15T22:00:00Z"),
        status: "active",
        currentPhase: "finals"
      },
      {
        name: "Miss World 2025",
        description: "International beauty pageant with emphasis on personality and charity work",
        startDate: new Date("2025-09-20T19:00:00Z"),
        endDate: new Date("2025-09-20T23:00:00Z"),
        status: "upcoming",
        currentPhase: "registration"
      },
      {
        name: "Miss International 2025",
        description: "Beauty pageant promoting international friendship and goodwill",
        startDate: new Date("2025-07-01T18:00:00Z"),
        endDate: new Date("2025-07-01T22:00:00Z"),
        status: "completed",
        currentPhase: "completed"
      }
    ];

    const createdEvents = await db.insert(events).values(eventData).returning();
    const activeEvent = createdEvents[0]; // Miss Universe 2025

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
        occupation: "University Student & Mental Health Advocate",
        talent: "Classical Piano & Vocal Performance",
        achievements: "Miss Miami 2024, Mental Health Awareness Award"
      },
      { 
        userId: "contestant2", 
        eventId: activeEvent.id, 
        contestantNumber: 2,
        status: "approved",
        bio: "Professional dancer and choreographer dedicated to youth education and empowerment.",
        age: 24,
        location: "New York, New York",
        occupation: "Dance Instructor & Choreographer",
        talent: "Contemporary Dance & Choreography",
        achievements: "Regional Dance Champion, Youth Education Award"
      },
      { 
        userId: "contestant3", 
        eventId: activeEvent.id, 
        contestantNumber: 3,
        status: "approved",
        bio: "Environmental science graduate working on sustainable living initiatives.",
        age: 23,
        location: "Portland, Oregon",
        occupation: "Environmental Scientist",
        talent: "Operatic Vocal Performance",
        achievements: "Environmental Innovation Award, Sustainability Leader"
      },
      { 
        userId: "contestant4", 
        eventId: activeEvent.id, 
        contestantNumber: 4,
        status: "approved",
        bio: "Artist and social worker helping underprivileged communities through art therapy.",
        age: 25,
        location: "Los Angeles, California",
        occupation: "Art Therapist & Social Worker",
        talent: "Live Painting Performance",
        achievements: "Community Service Excellence, Art Therapy Innovation"
      },
      { 
        userId: "contestant5", 
        eventId: activeEvent.id, 
        contestantNumber: 5,
        status: "approved",
        bio: "Medical student specializing in pediatric care with volunteer work in rural communities.",
        age: 26,
        location: "Houston, Texas",
        occupation: "Medical Student",
        talent: "Violin & Classical Music",
        achievements: "Medical Honor Society, Rural Healthcare Volunteer"
      },
      { 
        userId: "contestant6", 
        eventId: activeEvent.id, 
        contestantNumber: 6,
        status: "approved",
        bio: "Technology entrepreneur developing apps for educational accessibility.",
        age: 24,
        location: "San Francisco, California",
        occupation: "Tech Entrepreneur",
        talent: "Digital Art & Technology Presentation",
        achievements: "Tech Innovation Award, Educational App Developer"
      },
      { 
        userId: "contestant7", 
        eventId: activeEvent.id, 
        contestantNumber: 7,
        status: "approved",
        bio: "Journalism graduate reporting on social justice issues and human rights.",
        age: 23,
        location: "Chicago, Illinois",
        occupation: "Journalist & Human Rights Advocate",
        talent: "Spoken Word Poetry",
        achievements: "Journalism Excellence Award, Human Rights Recognition"
      },
      { 
        userId: "contestant8", 
        eventId: activeEvent.id, 
        contestantNumber: 8,
        status: "approved",
        bio: "Professional athlete and fitness coach promoting healthy lifestyle choices.",
        age: 22,
        location: "Denver, Colorado",
        occupation: "Professional Athlete & Fitness Coach",
        talent: "Gymnastics & Acrobatic Performance",
        achievements: "State Athletic Champion, Fitness Leadership Award"
      }
    ];

    const createdContestants = await db.insert(contestants).values(contestantData).returning();

    // Create multiple phases for all events
    const phaseData = [];
    
    // Create phases for each event
    for (const event of createdEvents) {
      if (event.status === 'active') {
        // Active event - Miss Universe 2025
        // For active event, we need to reference the created shows
        if (event.id === activeEvent.id) {
          phaseData.push(
            {
              eventId: event.id,
              showId: createdShows[0].id, // Use first show for preliminaries
              name: "Preliminaries",
              order: 1,
              status: "completed",
              resetScores: false
            },
            {
              eventId: event.id,
              showId: createdShows[1].id, // Use second show for semi-finals
              name: "Semi-Finals",
              order: 2,
              status: "completed",
              resetScores: false
            },
            {
              eventId: event.id,
              showId: createdShows[2].id, // Use third show for finals
              name: "Finals",
              order: 3,
              status: "active",
              resetScores: true
            }
          );
        }
      } else if (event.status === 'upcoming') {
        // Upcoming event - Miss World 2025
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
        // Completed event - Miss International 2025
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
    }

    const createdPhases = await db.insert(phases).values(phaseData).returning();
    const finalsPhase = createdPhases.find(p => p.name === "Finals" && p.status === "active"); // Finals phase for active event

    // Create shows (main competition categories)
    const showsData = [
      { eventId: activeEvent.id, name: "Interview", description: "Communication skills, intelligence, and personality", weight: 30, order: 1 },
      { eventId: activeEvent.id, name: "Talent", description: "Individual talent performance and stage presence", weight: 25, order: 2 },
      { eventId: activeEvent.id, name: "Evening Gown", description: "Poise, elegance, and grace in formal wear", weight: 25, order: 3 },
      { eventId: activeEvent.id, name: "Swimwear", description: "Confidence, fitness, and stage presence", weight: 20, order: 4 }
    ];

    const createdShows = await db.insert(shows).values(showsData).returning();

    // Create criteria for each show
    const criteriaData = [
      // Interview criteria
      { showId: createdShows[0].id, name: "Communication Skills", description: "Clarity, articulation, and verbal expression", weight: 35, maxScore: 10 },
      { showId: createdShows[0].id, name: "Intelligence & Knowledge", description: "General knowledge and intellectual capacity", weight: 30, maxScore: 10 },
      { showId: createdShows[0].id, name: "Confidence & Poise", description: "Self-assurance and composure under pressure", weight: 25, maxScore: 10 },
      { showId: createdShows[0].id, name: "Personality & Charisma", description: "Natural charm and likability", weight: 10, maxScore: 10 },
      
      // Talent criteria
      { showId: createdShows[1].id, name: "Skill Level", description: "Technical proficiency and mastery", weight: 40, maxScore: 10 },
      { showId: createdShows[1].id, name: "Stage Presence", description: "Commanding attention and engagement", weight: 30, maxScore: 10 },
      { showId: createdShows[1].id, name: "Creativity & Originality", description: "Uniqueness and creative expression", weight: 20, maxScore: 10 },
      { showId: createdShows[1].id, name: "Overall Performance", description: "Entertainment value and execution", weight: 10, maxScore: 10 },
      
      // Evening Gown criteria
      { showId: createdShows[2].id, name: "Elegance & Grace", description: "Sophisticated movement and bearing", weight: 35, maxScore: 10 },
      { showId: createdShows[2].id, name: "Poise & Posture", description: "Confident stance and walk", weight: 30, maxScore: 10 },
      { showId: createdShows[2].id, name: "Gown Selection", description: "Appropriate choice and fit", weight: 25, maxScore: 10 },
      { showId: createdShows[2].id, name: "Overall Presentation", description: "Complete package and impression", weight: 10, maxScore: 10 },
      
      // Swimwear criteria
      { showId: createdShows[3].id, name: "Physical Fitness", description: "Health and conditioning", weight: 40, maxScore: 10 },
      { showId: createdShows[3].id, name: "Confidence", description: "Self-assurance and comfort", weight: 30, maxScore: 10 },
      { showId: createdShows[3].id, name: "Stage Presence", description: "Commanding the stage", weight: 20, maxScore: 10 },
      { showId: createdShows[3].id, name: "Overall Impression", description: "Complete presentation", weight: 10, maxScore: 10 },
    ];

    const createdCriteria = await db.insert(criteria).values(criteriaData).returning();

    // Create realistic scoring data for finals phase
    const scoreData = [];
    
    // Realistic score ranges for each contestant (top 5 finalists)
    const finalistScores = [
      { // Contestant 1 - Winner (Isabella Rodriguez)
        interview: [92, 94, 91, 93, 90],
        talent: [88, 90, 89, 87, 91],
        eveningGown: [95, 92, 94, 96, 93],
        swimwear: [89, 91, 88, 90, 87]
      },
      { // Contestant 2 - Runner-up (Sophia Taylor)
        interview: [89, 91, 87, 90, 88],
        talent: [95, 93, 96, 94, 92],
        eveningGown: [90, 89, 91, 88, 90],
        swimwear: [87, 89, 86, 88, 85]
      },
      { // Contestant 3 - Third place (Olivia Anderson)
        interview: [85, 87, 89, 86, 88],
        talent: [90, 88, 91, 89, 87],
        eveningGown: [88, 90, 87, 89, 86],
        swimwear: [90, 88, 89, 87, 91]
      },
      { // Contestant 4 - Fourth place (Ava Martinez)
        interview: [83, 85, 84, 86, 82],
        talent: [87, 89, 85, 88, 86],
        eveningGown: [85, 87, 86, 84, 88],
        swimwear: [84, 86, 83, 85, 87]
      },
      { // Contestant 5 - Fifth place (Mia Brown)
        interview: [81, 83, 85, 82, 84],
        talent: [84, 86, 82, 85, 83],
        eveningGown: [83, 85, 84, 82, 86],
        swimwear: [82, 84, 81, 83, 85]
      }
    ];

    // Create scores for top 5 finalists (only if finals phase exists)
    if (finalsPhase) {
      for (let i = 0; i < 5; i++) {
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
              score: scores.interview[j]
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
              score: scores.talent[j]
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
              score: scores.eveningGown[j]
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
              score: scores.swimwear[j]
            });
          }
        }
      }
    }

    await db.insert(scores).values(scoreData);

    console.log("✅ Comprehensive database seeding completed!");
    console.log(`Created ${createdEvents.length} events`);
    console.log(`Created ${createdContestants.length} contestants`);
    console.log(`Created ${createdJudges.length} judges`);
    console.log(`Created ${createdShows.length} shows and ${createdCriteria.length} criteria`);
    console.log(`Created ${createdPhases.length} phases`);
    console.log(`Created ${scoreData.length} scores`);
    console.log(`\n🎯 Active Event: ${activeEvent.name}`);
    console.log(`📊 Finals Phase: ${finalsPhase ? finalsPhase.name + ' (with score reset)' : 'No active finals phase'}`);
    console.log(`👑 Winner: Isabella Rodriguez`);

  } catch (error) {
    console.error("❌ Error seeding comprehensive data:", error);
  }
}

seedComprehensiveData();