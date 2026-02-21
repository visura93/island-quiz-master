import type { QuizAttempt, StreakInfo } from './api';

export type GoalType = 'quiz_count' | 'score_target' | 'streak';
export type GoalPeriod = 'weekly' | 'monthly';

export interface StudyGoal {
  id: string;
  type: GoalType;
  title: string;
  target: number;
  current: number;
  subject?: string;
  period: GoalPeriod;
  startDate: string;
  endDate: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
}

const GOALS_KEY = 'study_goals';
const MAX_ACTIVE_GOALS = 5;

function generateId(): string {
  return `goal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getPeriodDates(period: GoalPeriod): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (period === 'weekly') {
    const dayOfWeek = now.getDay();
    start.setDate(now.getDate() - dayOfWeek);
    end.setDate(start.getDate() + 6);
  } else {
    start.setDate(1);
    end.setMonth(end.getMonth() + 1, 0);
  }

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

function buildTitle(type: GoalType, target: number, subject?: string): string {
  switch (type) {
    case 'quiz_count':
      return `Complete ${target} quizzes`;
    case 'score_target':
      return `Achieve ${target}%+ in ${subject ?? 'all subjects'}`;
    case 'streak':
      return `Maintain a ${target}-day streak`;
  }
}

export function getAllGoals(): StudyGoal[] {
  try {
    const data = localStorage.getItem(GOALS_KEY);
    return data ? (JSON.parse(data) as StudyGoal[]) : [];
  } catch {
    return [];
  }
}

export function getActiveGoals(): StudyGoal[] {
  return getAllGoals().filter((g) => !g.completed && !isGoalExpired(g));
}

export function getCompletedGoals(): StudyGoal[] {
  return getAllGoals().filter((g) => g.completed);
}

export function getCompletedGoalCount(): number {
  return getCompletedGoals().length;
}

function saveGoals(goals: StudyGoal[]): void {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

export function isGoalExpired(goal: StudyGoal): boolean {
  return !goal.completed && new Date(goal.endDate) < new Date();
}

export interface CreateGoalInput {
  type: GoalType;
  target: number;
  subject?: string;
  period: GoalPeriod;
}

export function createGoal(input: CreateGoalInput): StudyGoal | null {
  const active = getActiveGoals();
  if (active.length >= MAX_ACTIVE_GOALS) return null;

  const { start, end } = getPeriodDates(input.period);
  const goal: StudyGoal = {
    id: generateId(),
    type: input.type,
    title: buildTitle(input.type, input.target, input.subject),
    target: input.target,
    current: 0,
    subject: input.subject,
    period: input.period,
    startDate: start,
    endDate: end,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  const all = getAllGoals();
  all.push(goal);
  saveGoals(all);
  return goal;
}

export function deleteGoal(id: string): void {
  const all = getAllGoals().filter((g) => g.id !== id);
  saveGoals(all);
}

export function computeGoalProgress(
  goal: StudyGoal,
  completedQuizzes: QuizAttempt[],
  streakInfo: StreakInfo | null
): number {
  const start = new Date(goal.startDate);
  const end = new Date(goal.endDate);

  switch (goal.type) {
    case 'quiz_count': {
      const inPeriod = completedQuizzes.filter((q) => {
        const d = new Date(q.completedDate);
        return d >= start && d <= end;
      });
      return inPeriod.length;
    }
    case 'score_target': {
      const relevant = completedQuizzes.filter((q) => {
        const d = new Date(q.completedDate);
        const inPeriod = d >= start && d <= end;
        const matchSubject = !goal.subject || q.subject.toLowerCase() === goal.subject.toLowerCase();
        return inPeriod && matchSubject;
      });
      if (relevant.length === 0) return 0;
      const avg = relevant.reduce((sum, q) => sum + q.score, 0) / relevant.length;
      return Math.round(avg);
    }
    case 'streak': {
      return streakInfo?.currentStreak ?? 0;
    }
  }
}

export function refreshGoalProgress(
  completedQuizzes: QuizAttempt[],
  streakInfo: StreakInfo | null
): StudyGoal[] {
  const all = getAllGoals();
  let changed = false;

  for (const goal of all) {
    if (goal.completed) continue;

    const progress = computeGoalProgress(goal, completedQuizzes, streakInfo);
    if (progress !== goal.current) {
      goal.current = progress;
      changed = true;
    }

    if (!goal.completed && progress >= goal.target) {
      goal.completed = true;
      goal.completedAt = new Date().toISOString();
      changed = true;
    }
  }

  if (changed) saveGoals(all);
  return all;
}

export function cleanExpiredGoals(): void {
  const all = getAllGoals();
  const kept = all.filter((g) => g.completed || !isGoalExpired(g));
  if (kept.length !== all.length) {
    saveGoals(kept);
  }
}
