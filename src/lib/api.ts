const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:57629/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'Student' | 'Teacher' | 'Admin';
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  role: 'Student' | 'Teacher' | 'Admin' | number;
  createdAt: string;
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface RefreshTokenRequest {
  token: string;
  refreshToken: string;
}

export interface QuizBundle {
  id: string;
  title: string;
  description: string;
  year: string;
  paperCount: number;
  difficulty: string;
  thumbnail?: string;
  quizzes: Quiz[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  grade: string;
  medium: string;
  subject: string;
  type: string;
  timeLimit: number;
  difficulty: string;
  year: number;
  questionCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface QuizAnswer {
  id: string;
  questionText: string;
  options: string[];
  selectedAnswerIndex: number;
  correctAnswerIndex: number;
  isCorrect: boolean;
  explanation?: string;
  answeredAt: string;
}

export interface QuizAttempt {
  id: string;
  quizTitle: string;
  subject: string;
  grade: string;
  medium: string;
  type: string;
  completedDate: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  timeLimit: number;
  difficulty: string;
  status: string;
  questions: QuizAnswer[];
}

export interface TimeAnalytics {
  totalTime: number;
  daily: DailyTime[];
  weekly: WeeklyTime[];
  monthly: MonthlyTime[];
  subjectBreakdown: SubjectTime[];
  typeBreakdown: TypeTime[];
  recentActivity: RecentActivity[];
}

export interface DailyTime {
  day: string;
  time: number;
  subject: string;
}

export interface WeeklyTime {
  week: string;
  time: number;
  quizzes: number;
}

export interface MonthlyTime {
  month: string;
  time: number;
  quizzes: number;
}

export interface SubjectTime {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface TypeTime {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export interface RecentActivity {
  time: string;
  subject: string;
  duration: number;
  type: string;
}

export interface StartQuizRequest {
  quizId: string;
}

export interface StartQuizResponse {
  attemptId: string;
  quizId: string;
  title: string;
  timeLimit: number; // in minutes
  questions: Question[];
}

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  order: number;
}

export interface SubmitAnswerRequest {
  questionId: string;
  selectedAnswerIndex: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = localStorage.getItem('token');

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async refreshToken(refreshData: RefreshTokenRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(refreshData),
    });
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', {
      method: 'POST',
    });
  }

  // Quiz endpoints
  async getQuizBundles(grade: string, medium: string, subject: string, type: string): Promise<QuizBundle[]> {
    const params = new URLSearchParams({
      grade,
      medium,
      subject,
      type
    });
    return this.request<QuizBundle[]>(`/quiz/bundles?${params}`);
  }

  async getQuiz(id: string): Promise<Quiz> {
    return this.request<Quiz>(`/quiz/${id}`);
  }

  async searchQuizzes(query: string): Promise<Quiz[]> {
    return this.request<Quiz[]>(`/quiz/search?query=${encodeURIComponent(query)}`);
  }

  // Quiz attempt endpoints
  async startQuiz(quizId: string): Promise<StartQuizResponse> {
    return this.request<StartQuizResponse>('/quizattempt/start', {
      method: 'POST',
      body: JSON.stringify({ quizId }),
    });
  }

  async getQuizQuestions(quizId: string): Promise<Question[]> {
    return this.request<Question[]>(`/quiz/${quizId}/questions`);
  }

  async submitAnswer(attemptId: string, questionId: string, selectedAnswerIndex: number): Promise<void> {
    await this.request(`/quizattempt/${attemptId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId, selectedAnswerIndex }),
    });
  }

  async completeQuiz(attemptId: string): Promise<QuizAttempt> {
    return this.request<QuizAttempt>(`/quizattempt/${attemptId}/complete`, {
      method: 'POST',
    });
  }

  async getCompletedQuizzes(): Promise<QuizAttempt[]> {
    return this.request<QuizAttempt[]>('/quizattempt/completed');
  }

  async getTimeAnalytics(): Promise<TimeAnalytics> {
    return this.request<TimeAnalytics>('/quizattempt/time-analytics');
  }
}

export const apiService = new ApiService();
