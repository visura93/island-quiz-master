import type { QuizAttempt, StreakInfo } from './api';
import { getCompletedGoalCount } from './goalsStore';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  lockedDescription: string;
  icon: string;
  rarity: BadgeRarity;
}

export interface EarnedBadge extends BadgeDefinition {
  unlockedAt: string;
}

export interface BadgeProgress {
  badge: BadgeDefinition;
  earned: boolean;
  unlockedAt?: string;
  progressValue: number;
  progressMax: number;
  progressLabel: string;
}

const BADGES_CACHE_KEY = 'earned_badges';
const NEW_BADGES_KEY = 'unseen_badges';

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first_quiz',
    name: 'First Quiz',
    description: 'Completed your very first quiz',
    lockedDescription: 'Complete your first quiz',
    icon: 'Rocket',
    rarity: 'common',
  },
  {
    id: 'quiz_veteran',
    name: 'Quiz Veteran',
    description: 'Completed 25 quizzes',
    lockedDescription: 'Complete 25 quizzes',
    icon: 'BookOpen',
    rarity: 'rare',
  },
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Completed 100 quizzes',
    lockedDescription: 'Complete 100 quizzes',
    icon: 'Crown',
    rarity: 'legendary',
  },
  {
    id: 'perfect_score',
    name: 'Perfect Score',
    description: 'Scored 100% on a quiz',
    lockedDescription: 'Get 100% on any quiz',
    icon: 'Star',
    rarity: 'epic',
  },
  {
    id: 'high_achiever',
    name: 'High Achiever',
    description: 'Averaged 80%+ across all quizzes',
    lockedDescription: 'Achieve an 80%+ overall average',
    icon: 'TrendingUp',
    rarity: 'rare',
  },
  {
    id: 'subject_expert',
    name: 'Subject Expert',
    description: '90%+ average in a subject (min 5 quizzes)',
    lockedDescription: 'Get 90%+ average in any subject',
    icon: 'GraduationCap',
    rarity: 'epic',
  },
  {
    id: 'streak_starter',
    name: 'Streak Starter',
    description: 'Reached a 3-day practice streak',
    lockedDescription: 'Build a 3-day streak',
    icon: 'Flame',
    rarity: 'common',
  },
  {
    id: 'streak_master',
    name: 'Streak Master',
    description: 'Reached a 7-day practice streak',
    lockedDescription: 'Build a 7-day streak',
    icon: 'Flame',
    rarity: 'rare',
  },
  {
    id: 'streak_legend',
    name: 'Streak Legend',
    description: 'Reached a 30-day practice streak',
    lockedDescription: 'Build a 30-day streak',
    icon: 'Flame',
    rarity: 'legendary',
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Finished a quiz in under half the time limit',
    lockedDescription: 'Complete a quiz in under half the time limit',
    icon: 'Zap',
    rarity: 'epic',
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Completed a quiz between 10 PM and 5 AM',
    lockedDescription: 'Complete a quiz late at night',
    icon: 'Moon',
    rarity: 'rare',
  },
  {
    id: 'goal_setter',
    name: 'Goal Setter',
    description: 'Created your first study goal',
    lockedDescription: 'Create a study goal',
    icon: 'Target',
    rarity: 'common',
  },
  {
    id: 'goal_crusher',
    name: 'Goal Crusher',
    description: 'Completed 5 study goals',
    lockedDescription: 'Complete 5 study goals',
    icon: 'Trophy',
    rarity: 'epic',
  },
];

function loadCachedBadges(): Record<string, string> {
  try {
    const data = localStorage.getItem(BADGES_CACHE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveCachedBadges(cache: Record<string, string>): void {
  localStorage.setItem(BADGES_CACHE_KEY, JSON.stringify(cache));
}

function addUnseenBadge(badgeId: string): void {
  try {
    const data = localStorage.getItem(NEW_BADGES_KEY);
    const unseen: string[] = data ? JSON.parse(data) : [];
    if (!unseen.includes(badgeId)) {
      unseen.push(badgeId);
      localStorage.setItem(NEW_BADGES_KEY, JSON.stringify(unseen));
    }
  } catch { /* noop */ }
}

export function getUnseenBadges(): string[] {
  try {
    const data = localStorage.getItem(NEW_BADGES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function markBadgesSeen(badgeIds: string[]): void {
  try {
    const data = localStorage.getItem(NEW_BADGES_KEY);
    const unseen: string[] = data ? JSON.parse(data) : [];
    const remaining = unseen.filter((id) => !badgeIds.includes(id));
    localStorage.setItem(NEW_BADGES_KEY, JSON.stringify(remaining));
  } catch { /* noop */ }
}

interface BadgeCheckContext {
  quizzes: QuizAttempt[];
  streak: StreakInfo | null;
  goalsCreated: number;
  goalsCompleted: number;
}

function checkBadgeEarned(id: string, ctx: BadgeCheckContext): boolean {
  switch (id) {
    case 'first_quiz':
      return ctx.quizzes.length >= 1;
    case 'quiz_veteran':
      return ctx.quizzes.length >= 25;
    case 'century_club':
      return ctx.quizzes.length >= 100;
    case 'perfect_score':
      return ctx.quizzes.some((q) => q.score >= 100);
    case 'high_achiever': {
      if (ctx.quizzes.length < 3) return false;
      const avg = ctx.quizzes.reduce((s, q) => s + q.score, 0) / ctx.quizzes.length;
      return avg >= 80;
    }
    case 'subject_expert': {
      const bySubject: Record<string, number[]> = {};
      for (const q of ctx.quizzes) {
        const key = q.subject.toLowerCase();
        (bySubject[key] ??= []).push(q.score);
      }
      return Object.values(bySubject).some(
        (scores) => scores.length >= 5 && scores.reduce((a, b) => a + b, 0) / scores.length >= 90
      );
    }
    case 'streak_starter':
      return (ctx.streak?.longestStreak ?? 0) >= 3;
    case 'streak_master':
      return (ctx.streak?.longestStreak ?? 0) >= 7;
    case 'streak_legend':
      return (ctx.streak?.longestStreak ?? 0) >= 30;
    case 'speed_demon':
      return ctx.quizzes.some((q) => q.timeLimit > 0 && q.timeSpent < (q.timeLimit * 60) / 2);
    case 'night_owl':
      return ctx.quizzes.some((q) => {
        const hour = new Date(q.completedDate).getHours();
        return hour >= 22 || hour < 5;
      });
    case 'goal_setter':
      return ctx.goalsCreated >= 1;
    case 'goal_crusher':
      return ctx.goalsCompleted >= 5;
    default:
      return false;
  }
}

function getBadgeProgressValues(id: string, ctx: BadgeCheckContext): { value: number; max: number; label: string } {
  switch (id) {
    case 'first_quiz':
      return { value: Math.min(ctx.quizzes.length, 1), max: 1, label: `${Math.min(ctx.quizzes.length, 1)}/1 quiz` };
    case 'quiz_veteran':
      return { value: Math.min(ctx.quizzes.length, 25), max: 25, label: `${Math.min(ctx.quizzes.length, 25)}/25 quizzes` };
    case 'century_club':
      return { value: Math.min(ctx.quizzes.length, 100), max: 100, label: `${Math.min(ctx.quizzes.length, 100)}/100 quizzes` };
    case 'perfect_score': {
      const best = ctx.quizzes.reduce((m, q) => Math.max(m, q.score), 0);
      return { value: best, max: 100, label: `Best: ${best}%` };
    }
    case 'high_achiever': {
      if (ctx.quizzes.length === 0) return { value: 0, max: 80, label: '0% avg' };
      const avg = Math.round(ctx.quizzes.reduce((s, q) => s + q.score, 0) / ctx.quizzes.length);
      return { value: Math.min(avg, 80), max: 80, label: `${avg}% avg` };
    }
    case 'subject_expert': {
      const bySubject: Record<string, number[]> = {};
      for (const q of ctx.quizzes) {
        const key = q.subject.toLowerCase();
        (bySubject[key] ??= []).push(q.score);
      }
      let bestAvg = 0;
      let bestSubject = '';
      for (const [subj, scores] of Object.entries(bySubject)) {
        if (scores.length >= 5) {
          const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
          if (avg > bestAvg) { bestAvg = avg; bestSubject = subj; }
        }
      }
      if (!bestSubject) {
        const maxCount = Math.max(...Object.values(bySubject).map((s) => s.length), 0);
        return { value: maxCount, max: 5, label: `${maxCount}/5 quizzes in best subject` };
      }
      return { value: Math.min(Math.round(bestAvg), 90), max: 90, label: `${Math.round(bestAvg)}% in ${bestSubject}` };
    }
    case 'streak_starter':
      return { value: Math.min(ctx.streak?.longestStreak ?? 0, 3), max: 3, label: `${Math.min(ctx.streak?.longestStreak ?? 0, 3)}/3 days` };
    case 'streak_master':
      return { value: Math.min(ctx.streak?.longestStreak ?? 0, 7), max: 7, label: `${Math.min(ctx.streak?.longestStreak ?? 0, 7)}/7 days` };
    case 'streak_legend':
      return { value: Math.min(ctx.streak?.longestStreak ?? 0, 30), max: 30, label: `${Math.min(ctx.streak?.longestStreak ?? 0, 30)}/30 days` };
    case 'speed_demon': {
      const fastest = ctx.quizzes
        .filter((q) => q.timeLimit > 0)
        .reduce((best, q) => {
          const ratio = q.timeSpent / (q.timeLimit * 60);
          return ratio < best ? ratio : best;
        }, 1);
      return { value: Math.round((1 - fastest) * 100), max: 50, label: fastest < 1 ? `${Math.round(fastest * 100)}% of time used` : 'No data yet' };
    }
    case 'night_owl':
      return { value: ctx.quizzes.some((q) => { const h = new Date(q.completedDate).getHours(); return h >= 22 || h < 5; }) ? 1 : 0, max: 1, label: 'Complete a late-night quiz' };
    case 'goal_setter':
      return { value: Math.min(ctx.goalsCreated, 1), max: 1, label: `${Math.min(ctx.goalsCreated, 1)}/1 goal created` };
    case 'goal_crusher':
      return { value: Math.min(ctx.goalsCompleted, 5), max: 5, label: `${Math.min(ctx.goalsCompleted, 5)}/5 goals completed` };
    default:
      return { value: 0, max: 1, label: '' };
  }
}

export function evaluateBadges(
  quizzes: QuizAttempt[],
  streak: StreakInfo | null
): BadgeProgress[] {
  const cache = loadCachedBadges();
  const goalsCreated = getAllGoalsCount();
  const goalsCompleted = getCompletedGoalCount();
  const ctx: BadgeCheckContext = { quizzes, streak, goalsCreated, goalsCompleted };
  const results: BadgeProgress[] = [];

  for (const def of BADGE_DEFINITIONS) {
    const wasCached = !!cache[def.id];
    const isEarned = wasCached || checkBadgeEarned(def.id, ctx);

    if (isEarned && !wasCached) {
      cache[def.id] = new Date().toISOString();
      addUnseenBadge(def.id);
    }

    const { value, max, label } = getBadgeProgressValues(def.id, ctx);
    results.push({
      badge: def,
      earned: isEarned,
      unlockedAt: cache[def.id],
      progressValue: value,
      progressMax: max,
      progressLabel: label,
    });
  }

  saveCachedBadges(cache);
  return results;
}

export function getEarnedBadges(): EarnedBadge[] {
  const cache = loadCachedBadges();
  return BADGE_DEFINITIONS
    .filter((d) => !!cache[d.id])
    .map((d) => ({ ...d, unlockedAt: cache[d.id] }));
}

export function getRecentBadges(limit = 4): EarnedBadge[] {
  return getEarnedBadges()
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, limit);
}

function getAllGoalsCount(): number {
  try {
    const data = localStorage.getItem('study_goals');
    return data ? JSON.parse(data).length : 0;
  } catch {
    return 0;
  }
}

export const RARITY_STYLES: Record<BadgeRarity, { border: string; bg: string; glow: string; text: string }> = {
  common: {
    border: 'border-slate-300 dark:border-slate-600',
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    glow: '',
    text: 'text-slate-500 dark:text-slate-400',
  },
  rare: {
    border: 'border-blue-300 dark:border-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    glow: 'shadow-blue-200/50 dark:shadow-blue-800/30',
    text: 'text-blue-600 dark:text-blue-400',
  },
  epic: {
    border: 'border-purple-300 dark:border-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/30',
    glow: 'shadow-purple-200/50 dark:shadow-purple-800/30',
    text: 'text-purple-600 dark:text-purple-400',
  },
  legendary: {
    border: 'border-amber-400 dark:border-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    glow: 'shadow-amber-200/60 dark:shadow-amber-700/30',
    text: 'text-amber-600 dark:text-amber-400',
  },
};
