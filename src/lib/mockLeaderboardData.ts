import type {
  LeaderboardResponse,
  LeaderboardEntry,
  LeaderboardFilters,
  StreakInfo,
  StreakLeaderboardEntry,
} from './api';

const SRI_LANKAN_NAMES = [
  'Kavinda Perera', 'Sachini Fernando', 'Dinesh Wickramasinghe', 'Nethmi Silva',
  'Tharuka Jayawardena', 'Ishara Bandara', 'Chamodi Rathnayake', 'Ravindu Dissanayake',
  'Sithumi Herath', 'Lahiru Gunasekara', 'Pawani Wijesinghe', 'Malith Samaraweera',
  'Hiruni Karunaratne', 'Ashan Rajapaksha', 'Thisari Senanayake', 'Nipun Weerasinghe',
  'Dulani Liyanage', 'Kasun Abeysekara', 'Rashmi Kumarasinghe', 'Pasan Pathirana',
  'Maneesha De Silva', 'Chamath Gamage', 'Sanduni Amarasinghe', 'Vimukthi Ekanayake',
  'Nimasha Tennakoon', 'Hasitha Ranasinghe', 'Rashini Madushani', 'Shanaka Lakmal',
  'Dilhani Weerakoon', 'Kaveesha Mendis', 'Thilina Kumara', 'Iresha Jayasundara',
  'Pasindu Senarath', 'Nadeesha Priyankara', 'Oshadhi Vithanage', 'Janith Fonseka',
  'Sandali Munasinghe', 'Buddhika Samarakoon', 'Upeksha Gunawardena', 'Vinod Abeywickrama',
  'Gimhani Ratnayake', 'Chathura Alwis', 'Dewmini Karunanayake', 'Sahan Cooray',
  'Theshani Wimalasuriya', 'Nuwan Premaratne', 'Hansika Madurapperuma', 'Dilan Hettiarachchi',
  'Bhagya Siriwardena', 'Avishka Nanayakkara',
];

const SUBJECTS = [
  'Mathematics', 'Science', 'English', 'Sinhala', 'Buddhism', 'History',
  'Geography', 'Tamil', 'ICT', 'Commerce',
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateEntries(
  count: number,
  currentUserId: string,
  currentUserName: string,
  seed: number,
): LeaderboardEntry[] {
  const rand = seededRandom(seed);
  const entries: LeaderboardEntry[] = [];

  const usedNames = new Set<string>();
  const currentUserRank = Math.floor(rand() * 15) + 8; // rank 8-22

  for (let i = 0; i < count; i++) {
    const rank = i + 1;
    const isCurrentUser = rank === currentUserRank;

    let name: string;
    if (isCurrentUser) {
      name = currentUserName;
    } else {
      do {
        name = SRI_LANKAN_NAMES[Math.floor(rand() * SRI_LANKAN_NAMES.length)];
      } while (usedNames.has(name));
    }
    usedNames.add(name);

    const baseScore = Math.max(40, 98 - rank * 1.2 + (rand() * 10 - 5));
    entries.push({
      rank,
      studentId: isCurrentUser ? currentUserId : `student-${rank}-${seed}`,
      studentName: name,
      score: Math.round(Math.min(100, Math.max(30, baseScore)) * 10) / 10,
      quizzesCompleted: Math.floor(rand() * 180) + 20,
      currentStreak: Math.max(0, Math.floor(45 - rank * 0.6 + rand() * 10 - 5)),
      isCurrentUser,
    });
  }

  return entries;
}

function generateStreakEntries(
  count: number,
  currentUserId: string,
  currentUserName: string,
  seed: number,
): StreakLeaderboardEntry[] {
  const rand = seededRandom(seed + 999);
  const entries: StreakLeaderboardEntry[] = [];
  const usedNames = new Set<string>();
  const currentUserRank = Math.floor(rand() * 12) + 5;

  for (let i = 0; i < count; i++) {
    const rank = i + 1;
    const isCurrentUser = rank === currentUserRank;

    let name: string;
    if (isCurrentUser) {
      name = currentUserName;
    } else {
      do {
        name = SRI_LANKAN_NAMES[Math.floor(rand() * SRI_LANKAN_NAMES.length)];
      } while (usedNames.has(name));
    }
    usedNames.add(name);

    const currentStreak = Math.max(0, Math.floor(60 - rank * 1.5 + rand() * 8));
    entries.push({
      rank,
      studentId: isCurrentUser ? currentUserId : `student-streak-${rank}`,
      studentName: name,
      currentStreak,
      longestStreak: currentStreak + Math.floor(rand() * 20),
      isCurrentUser,
    });
  }

  return entries;
}

function buildStreakCalendar(seed: number): { date: string; active: boolean }[] {
  const rand = seededRandom(seed + 777);
  const calendar: { date: string; active: boolean }[] = [];
  const today = new Date();

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    // Recent days more likely active (simulates a current streak)
    const activeProbability = i < 12 ? 0.92 : i < 30 ? 0.6 : 0.4;
    calendar.push({ date: dateStr, active: rand() < activeProbability });
  }

  // Ensure the last N days are a streak
  const streakLen = 12;
  for (let i = calendar.length - streakLen; i < calendar.length; i++) {
    calendar[i].active = true;
  }

  return calendar;
}

export function getMockLeaderboard(
  filters: LeaderboardFilters,
  currentUserId: string,
  currentUserName: string,
): LeaderboardResponse {
  const seed = filters.subject
    ? filters.subject.charCodeAt(0) * 100 + (filters.period === 'week' ? 1 : filters.period === 'month' ? 2 : 3)
    : (filters.period === 'week' ? 10 : filters.period === 'month' ? 20 : 30);

  const limit = filters.limit || 50;
  const entries = generateEntries(limit, currentUserId, currentUserName, seed);
  const myEntry = entries.find(e => e.isCurrentUser);

  return {
    entries,
    totalParticipants: 234,
    myRank: myEntry?.rank ?? 15,
    myEntry,
    updatedAt: new Date().toISOString(),
  };
}

export function getMockSubjectLeaderboard(
  subject: string,
  filters: LeaderboardFilters,
  currentUserId: string,
  currentUserName: string,
): LeaderboardResponse {
  return getMockLeaderboard({ ...filters, subject }, currentUserId, currentUserName);
}

export function getMockStreakInfo(): StreakInfo {
  const calendar = buildStreakCalendar(42);
  return {
    currentStreak: 12,
    longestStreak: 23,
    lastActiveDate: new Date().toISOString().split('T')[0],
    streakCalendar: calendar,
    milestones: [
      { days: 7, achieved: true, achievedDate: '2025-12-10' },
      { days: 14, achieved: false },
      { days: 30, achieved: false },
      { days: 60, achieved: false },
      { days: 100, achieved: false },
    ],
  };
}

export function getMockStreakLeaderboard(
  currentUserId: string,
  currentUserName: string,
  limit = 30,
): StreakLeaderboardEntry[] {
  return generateStreakEntries(limit, currentUserId, currentUserName, 55);
}

export { SUBJECTS as MOCK_SUBJECTS };
