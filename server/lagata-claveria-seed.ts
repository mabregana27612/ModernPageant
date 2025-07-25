import { db } from './db';
import { users, contestants, judges, events, phases, shows, criteria, contestantPhases } from '../shared/schema';
import { eq } from 'drizzle-orm';

export async function seedLagataClaveriaData() {
  console.log('🌟 Starting LAGATA Claveria seed...');

  // Get the newly created event (assuming it's the most recent one)
  const existingEvents = await db.select().from(events).orderBy(events.createdAt);
  const targetEvent = existingEvents[existingEvents.length - 1]; // Get the newest event
  
  if (!targetEvent) {
    throw new Error('No event found to seed data for');
  }

  console.log(`📍 Seeding data for event: ${targetEvent.name}`);

  // Create judges with authentic Filipino names
  const judgeUsers = [
    {
      firstName: 'Maria Cristina',
      lastName: 'Santos-Rivera',
      email: `mariacristina.santos.${Date.now()}@lagata.gov.ph`,
      profileImageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      role: 'judge' as const
    },
    {
      firstName: 'Roberto',
      lastName: 'Dela Cruz',
      email: `roberto.delacruz.${Date.now()}@lagata.gov.ph`, 
      profileImageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      role: 'judge' as const
    },
    {
      firstName: 'Elena',
      lastName: 'Bautista-Mendoza',
      email: `elena.bautista.${Date.now()}@lagata.gov.ph`,
      profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b332c2b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      role: 'judge' as const
    },
    {
      firstName: 'Antonio',
      lastName: 'Reyes',
      email: `antonio.reyes.${Date.now()}@lagata.gov.ph`,
      profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      role: 'judge' as const
    },
    {
      firstName: 'Carmen',
      lastName: 'Torres-Villanueva',
      email: `carmen.torres.${Date.now()}@lagata.gov.ph`,
      profileImageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      role: 'judge' as const
    }
  ];

  // Create contestant users with authentic Filipino names
  const timestamp = Date.now();
  const contestantUsers = [
    {
      firstName: 'Isabella',
      lastName: 'Garcia',
      email: `isabella.garcia.${timestamp}@email.com`,
      profileImageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      role: 'contestant' as const
    },
    {
      firstName: 'Sophia',
      lastName: 'Fernandez',
      email: `sophia.fernandez.${timestamp + 1}@email.com`,
      profileImageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      role: 'contestant' as const
    },
    {
      firstName: 'Angelica',
      lastName: 'Lopez',
      email: `angelica.lopez.${timestamp + 2}@email.com`,
      profileImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      role: 'contestant' as const
    },
    {
      firstName: 'Gabriela',
      lastName: 'Valdez',
      email: `gabriela.valdez.${timestamp + 3}@email.com`,
      profileImageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      role: 'contestant' as const
    },
    {
      firstName: 'Catarina',
      lastName: 'Morales',
      email: `catarina.morales.${timestamp + 4}@email.com`,
      profileImageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      role: 'contestant' as const
    },
    {
      firstName: 'Natasha',
      lastName: 'Ramos',
      email: `natasha.ramos.${timestamp + 5}@email.com`,
      profileImageUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      role: 'contestant' as const
    },
    {
      firstName: 'Camila',
      lastName: 'Herrera',
      email: `camila.herrera.${timestamp + 6}@email.com`,
      profileImageUrl: 'https://images.unsplash.com/photo-1488207984-bd5835b1a785?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      role: 'contestant' as const
    },
    {
      firstName: 'Victoria',
      lastName: 'Castillo',
      email: `victoria.castillo.${timestamp + 7}@email.com`,
      profileImageUrl: 'https://images.unsplash.com/photo-1506863530036-1efeddceb993?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      role: 'contestant' as const
    },
    {
      firstName: 'Andrea',
      lastName: 'Jimenez',
      email: `andrea.jimenez.${timestamp + 8}@email.com`,
      profileImageUrl: 'https://images.unsplash.com/photo-1494790108755-2616b332c2b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      role: 'contestant' as const
    },
    {
      firstName: 'Daniela',
      lastName: 'Rivera',
      email: `daniela.rivera.${timestamp + 9}@email.com`,
      profileImageUrl: 'https://images.unsplash.com/photo-1521577352947-9bb58764b69a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
      role: 'contestant' as const
    }
  ];

  // Insert judge users
  const insertedJudgeUsers = [];
  for (const judgeUser of judgeUsers) {
    const [user] = await db.insert(users).values({
      ...judgeUser,
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    }).returning();
    insertedJudgeUsers.push(user);
  }

  // Insert contestant users
  const insertedContestantUsers = [];
  for (const contestantUser of contestantUsers) {
    const [user] = await db.insert(users).values({
      ...contestantUser,
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    }).returning();
    insertedContestantUsers.push(user);
  }

  console.log(`👥 Created ${insertedJudgeUsers.length} judge users`);
  console.log(`🎭 Created ${insertedContestantUsers.length} contestant users`);

  // Create judges
  const judgeData = [
    { expertise: 'Former Miss Misamis Oriental 2015', experience: '8 years pageant judging experience' },
    { expertise: 'Fashion Designer & Style Expert', experience: '12 years in fashion industry' },
    { expertise: 'Dance Choreographer & Performance Coach', experience: '15 years in entertainment' },
    { expertise: 'Public Speaking & Communication Expert', experience: '10 years corporate training' },
    { expertise: 'Beauty & Wellness Specialist', experience: '7 years in pageant industry' }
  ];

  const insertedJudges = [];
  for (let i = 0; i < insertedJudgeUsers.length; i++) {
    const [judge] = await db.insert(judges).values({
      userId: insertedJudgeUsers[i].id,
      eventId: targetEvent.id,
      specialization: `${judgeData[i].expertise} - ${judgeData[i].experience}`
    }).returning();
    insertedJudges.push(judge);
  }

  // Create contestants with authentic Filipino details
  const contestantData = [
    { age: 22, location: 'Claveria, Misamis Oriental', occupation: 'Elementary School Teacher', contestantNumber: 1, hobbies: 'Reading, Singing, Community Service' },
    { age: 24, location: 'Balingoan, Misamis Oriental', occupation: 'Tourism Officer', contestantNumber: 2, hobbies: 'Dancing, Photography, Travel Blogging' },
    { age: 21, location: 'Gingoog City, Misamis Oriental', occupation: 'Nursing Student', contestantNumber: 3, hobbies: 'Volleyball, Cooking, Volunteering' },
    { age: 23, location: 'Medina, Misamis Oriental', occupation: 'Marketing Assistant', contestantNumber: 4, hobbies: 'Writing, Painting, Social Media' },
    { age: 25, location: 'Salay, Misamis Oriental', occupation: 'Bank Teller', contestantNumber: 5, hobbies: 'Badminton, Baking, Financial Literacy Advocacy' },
    { age: 20, location: 'Lagonglong, Misamis Oriental', occupation: 'College Student (Education)', contestantNumber: 6, hobbies: 'Guitar Playing, Tutoring, Environmental Advocacy' },
    { age: 22, location: 'Jasaan, Misamis Oriental', occupation: 'Hotel Receptionist', contestantNumber: 7, hobbies: 'Swimming, Language Learning, Customer Service' },
    { age: 24, location: 'Villanueva, Misamis Oriental', occupation: 'Graphic Designer', contestantNumber: 8, hobbies: 'Digital Art, Hiking, Creative Workshops' },
    { age: 21, location: 'Libertad, Misamis Oriental', occupation: 'Call Center Agent', contestantNumber: 9, hobbies: 'Drama, Public Speaking, Youth Mentoring' },
    { age: 23, location: 'Initao, Misamis Oriental', occupation: 'Agricultural Technician', contestantNumber: 10, hobbies: 'Gardening, Research, Sustainable Farming' }
  ];

  const insertedContestants = [];
  for (let i = 0; i < insertedContestantUsers.length; i++) {
    const [contestant] = await db.insert(contestants).values({
      userId: insertedContestantUsers[i].id,
      eventId: targetEvent.id,
      ...contestantData[i],
      photoUrl: insertedContestantUsers[i].profileImageUrl
    }).returning();
    insertedContestants.push(contestant);
  }

  console.log(`🏆 Created ${insertedJudges.length} judges for ${targetEvent.name}`);
  console.log(`👑 Created ${insertedContestants.length} contestants for ${targetEvent.name}`);

  // Create phases for the event
  const phaseData = [
    { name: 'Preliminaries', description: 'Initial round showcasing all contestants', order: 1, status: 'completed' as const },
    { name: 'Semi-Finals', description: 'Top 5 contestants compete in final categories', order: 2, status: 'completed' as const },
    { name: 'Finals', description: 'Final round determining the winner', order: 3, status: 'active' as const }
  ];

  const insertedPhases = [];
  for (const phase of phaseData) {
    const [newPhase] = await db.insert(phases).values({
      eventId: targetEvent.id,
      ...phase
    }).returning();
    insertedPhases.push(newPhase);
  }

  // Create shows for each phase
  const showData = [
    { name: 'Interview', description: 'Question and answer segment showcasing intelligence and personality', weight: 25, order: 1 },
    { name: 'Talent', description: 'Individual talent presentation', weight: 25, order: 2 },
    { name: 'Evening Gown', description: 'Formal wear presentation with grace and elegance', weight: 30, order: 3 },
    { name: 'Swimwear', description: 'Fitness and confidence showcase', weight: 20, order: 4 }
  ];

  const insertedShows = [];
  for (const phase of insertedPhases) {
    for (const show of showData) {
      const [newShow] = await db.insert(shows).values({
        eventId: targetEvent.id,
        phaseId: phase.id,
        name: show.name,
        description: show.description,
        weight: show.weight.toString(),
        order: show.order
      }).returning();
      insertedShows.push(newShow);
    }
  }

  // Create criteria for each show
  const criteriaData = {
    'Interview': [
      { name: 'Communication Skills', description: 'Clarity, articulation, and verbal expression', weight: 35, maxScore: 35 },
      { name: 'Confidence & Poise', description: 'Self-assurance and composure under pressure', weight: 25, maxScore: 25 },
      { name: 'Intelligence & Knowledge', description: 'Depth of understanding and awareness', weight: 30, maxScore: 30 },
      { name: 'Personality & Charisma', description: 'Natural charm and likability', weight: 10, maxScore: 10 }
    ],
    'Talent': [
      { name: 'Skill & Technique', description: 'Technical ability and execution', weight: 40, maxScore: 40 },
      { name: 'Creativity & Originality', description: 'Innovation and uniqueness', weight: 30, maxScore: 30 },
      { name: 'Stage Presence', description: 'Command of stage and audience engagement', weight: 20, maxScore: 20 },
      { name: 'Entertainment Value', description: 'Overall appeal and enjoyment factor', weight: 10, maxScore: 10 }
    ],
    'Evening Gown': [
      { name: 'Grace & Elegance', description: 'Refined movement and sophisticated presence', weight: 35, maxScore: 35 },
      { name: 'Gown Selection & Fit', description: 'Appropriate choice and perfect fit', weight: 25, maxScore: 25 },
      { name: 'Walk & Posture', description: 'Runway technique and body alignment', weight: 25, maxScore: 25 },
      { name: 'Overall Presentation', description: 'Complete look and impact', weight: 15, maxScore: 15 }
    ],
    'Swimwear': [
      { name: 'Physical Fitness', description: 'Health, tone, and fitness level', weight: 40, maxScore: 40 },
      { name: 'Confidence & Comfort', description: 'Self-assurance in presentation', weight: 30, maxScore: 30 },
      { name: 'Walk & Movement', description: 'Fluid and confident movement', weight: 20, maxScore: 20 },
      { name: 'Overall Impact', description: 'Complete presentation and appeal', weight: 10, maxScore: 10 }
    ]
  };

  for (const show of insertedShows) {
    const showCriteria = criteriaData[show.name as keyof typeof criteriaData];
    if (showCriteria) {
      for (const criterion of showCriteria) {
        await db.insert(criteria).values({
          showId: show.id,
          name: criterion.name,
          description: criterion.description,
          weight: criterion.weight.toString(),
          maxScore: criterion.maxScore
        });
      }
    }
  }

  // Link all contestants to the Finals phase (active phase)
  const finalsPhase = insertedPhases.find(p => p.status === 'active');
  if (finalsPhase) {
    for (const contestant of insertedContestants) {
      await db.insert(contestantPhases).values({
        contestantId: contestant.id,
        phaseId: finalsPhase.id
      });
    }
  }

  console.log(`🎪 Created ${insertedShows.length} shows across ${insertedPhases.length} phases`);
  console.log(`📋 Created criteria for all shows`);
  console.log(`🔗 Linked all contestants to Finals phase`);

  return {
    event: targetEvent,
    judges: insertedJudges,
    contestants: insertedContestants,
    phases: insertedPhases,
    shows: insertedShows
  };
}

// Run seed if called directly
const isRunDirectly = import.meta.url === `file://${process.argv[1]}`;
if (isRunDirectly) {
  seedLagataClaveriaData()
    .then((result) => {
      console.log('✅ LAGATA Claveria seed completed successfully!');
      console.log(`📊 Summary:`);
      console.log(`   - Event: ${result.event.name}`);
      console.log(`   - Judges: ${result.judges.length}`);
      console.log(`   - Contestants: ${result.contestants.length}`);
      console.log(`   - Phases: ${result.phases.length}`);
      console.log(`   - Shows: ${result.shows.length}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error);
      process.exit(1);
    });
}