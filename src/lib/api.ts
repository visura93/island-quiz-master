const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://islandfirst-exendtg0a8c5cpfg.canadacentral-01.azurewebsites.net/api';

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
  isPremium?: boolean;
  subscriptionEndDate?: string;
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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface ErrorResponse {
  message: string;
  errors?: string[];
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
  thumbnail?: string;
  isFree?: boolean;
  isLocked?: boolean;
  displayOrder?: number;
}

export interface QuizAnswer {
  id: string;
  questionText: string;
  questionImage?: string;
  options: string[];
  optionImages?: string[];
  selectedAnswerIndex: number;
  selectedAnswerIndexes?: number[]; // For multiple answer support
  correctAnswerIndex: number;
  correctAnswerIndexes?: number[]; // For multiple answer support
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

export interface Subject {
  id: string;
  name: string;
  value: string;
  description: string;
  icon: string;
  category: string;
  freeQuizCount: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateSubjectRequest {
  name: string;
  value: string;
  description: string;
  icon: string;
  category: string;
  freeQuizCount: number;
  isActive: boolean;
  displayOrder: number;
}

export interface UpdateSubjectRequest {
  name: string;
  value: string;
  description: string;
  icon: string;
  category: string;
  freeQuizCount: number;
  isActive: boolean;
  displayOrder: number;
}

export interface QuizAccess {
  hasAccess: boolean;
  reason: string;
  freeQuizzesRemaining: number;
  totalFreeQuizzes: number;
}

export interface SystemSettings {
  id: string;
  enableScholarship: boolean;
  enableAL: boolean;
  enableOL: boolean;
  enableGradeSelection: boolean;
  updatedAt: string;
  updatedBy?: string;
}

export interface UpdateSystemSettingsRequest {
  enableScholarship: boolean;
  enableAL: boolean;
  enableOL: boolean;
  enableGradeSelection: boolean;
}

export interface StudentActivity {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  totalQuizzes: number;
  totalScore: number;
  averageScore: number;
  lastActivityDate: string;
  createdAt: string;
  isActive: boolean;
  isPremium: boolean;
  subscriptionStatus?: string;
  subscriptionEndDate?: string;
}

export interface StudentDetail extends User {
  totalQuizzes: number;
  totalScore: number;
  averageScore: number;
  lastActivityDate: string;
  quizAttempts: QuizAttempt[];
  isPremium: boolean;
  subscriptionStatus?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  paymentHistory: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  paymentDate: string;
  paymentMethod: string;
  status: string;
  subscriptionMonths: number;
  notes?: string;
}

export interface UpdateStudentPremiumRequest {
  isPremium: boolean;
  subscriptionMonths?: number;
  notes?: string;
}

export interface CreatePaymentRequest {
  studentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  subscriptionMonths: number;
  notes?: string;
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
  questionImage?: string;
  options: string[];
  optionImages?: string[];
  order: number;
}

export interface QuestionWithAnswer extends Question {
  correctAnswerIndex: number;
  correctAnswerIndexes?: number[]; // For multiple answer support
  explanation?: string;
}

export interface SubmitAnswerRequest {
  questionId: string;
  selectedAnswerIndex: number;
  selectedAnswerIndexes?: number[]; // For multiple answer support
}

export interface BlobUploadResponse {
  url: string; // SAS URL for uploading
  blobName: string;
  publicUrl: string; // Public URL to access the blob after upload
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  grade: string;
  medium: string;
  subject: string;
  type: string;
  term?: string;
  timeLimit: number;
  difficulty: string;
  year: number;
  thumbnail?: string;
  questions: CreateQuestionRequest[];
}

export interface CreateQuestionRequest {
  questionText?: string;
  questionImage?: string;
  options: string[];
  optionImages?: string[];
  correctAnswerIndex: number;
  correctAnswerIndexes?: number[]; // For multiple answer support
  explanation?: string;
  order: number;
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
      let errorData: ErrorResponse;
      const contentType = response.headers.get('content-type');
      
      try {
        // First, try to get the response as text to see what we're dealing with
        const responseText = await response.text();
        
        if (contentType && contentType.includes('application/json')) {
          // Try to parse as JSON
          try {
            errorData = JSON.parse(responseText);
          } catch {
            // If JSON parsing fails, use the text as message
            errorData = { message: responseText.trim() || `HTTP error! status: ${response.status}` };
          }
        } else {
          // Not JSON, try to parse anyway, but if it fails, use as plain text
          try {
            errorData = JSON.parse(responseText);
          } catch {
            // If it's plain text, use it as the message
            // Clean up the text (remove quotes and whitespace)
            const cleanText = responseText.trim().replace(/^["']|["']$/g, '');
            errorData = { message: cleanText || `HTTP error! status: ${response.status}` };
          }
        }
      } catch (err) {
        // Fallback if all parsing fails
        errorData = { message: `HTTP error! status: ${response.status}` };
      }
      
      // Ensure we have a message
      if (!errorData.message || errorData.message === 'An error occurred') {
        // For 401 errors (Unauthorized), provide a default message
        if (response.status === 401) {
          errorData.message = 'Invalid email or password';
        } else {
          errorData.message = errorData.message || `HTTP error! status: ${response.status}`;
        }
      }
      
      // Create a custom error object that includes the structured error response
      const error = new Error(errorData.message);
      (error as any).errors = errorData.errors || [errorData.message];
      (error as any).errorResponse = errorData;
      (error as any).status = response.status;
      
      throw error;
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

  async forgotPassword(email: string): Promise<void> {
    return this.request<void>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    return this.request<void>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword }),
    });
  }

  // Quiz endpoints
  async getQuizBundles(grade: string, medium: string, subject: string, type: string, term?: string): Promise<QuizBundle[]> {
    const params = new URLSearchParams({
      grade,
      medium,
      subject,
      type
    });
    if (term) {
      params.append('term', term);
    }
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

  async getQuizForEdit(quizId: string): Promise<{ quiz: Quiz; questions: QuestionWithAnswer[] }> {
    return this.request<{ quiz: Quiz; questions: QuestionWithAnswer[] }>(`/admin/quiz/${quizId}/edit`);
  }

  async submitAnswer(attemptId: string, questionId: string, selectedAnswerIndex: number, selectedAnswerIndexes?: number[]): Promise<void> {
    await this.request(`/quizattempt/${attemptId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ questionId, selectedAnswerIndex, selectedAnswerIndexes }),
    });
  }

  async completeQuiz(attemptId: string, timeSpent: number): Promise<QuizAttempt> {
    return this.request<QuizAttempt>(`/quizattempt/${attemptId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ timeSpent }),
    });
  }

  async getCompletedQuizzes(): Promise<QuizAttempt[]> {
    return this.request<QuizAttempt[]>('/quizattempt/completed');
  }

  async getQuizAttemptDetails(attemptId: string): Promise<QuizAttempt> {
    return this.request<QuizAttempt>(`/quizattempt/${attemptId}`);
  }

  async getTimeAnalytics(): Promise<TimeAnalytics> {
    return this.request<TimeAnalytics>('/quizattempt/time-analytics');
  }

  // Admin endpoints
  async getAllStudents(): Promise<StudentActivity[]> {
    return this.request<StudentActivity[]>('/admin/students');
  }

  async getStudentDetail(studentId: string): Promise<StudentDetail> {
    return this.request<StudentDetail>(`/admin/students/${studentId}`);
  }

  async getStudentQuizAttempts(studentId: string): Promise<QuizAttempt[]> {
    return this.request<QuizAttempt[]>(`/admin/students/${studentId}/quiz-attempts`);
  }

  async updateStudentPremium(studentId: string, data: UpdateStudentPremiumRequest): Promise<StudentDetail> {
    return this.request<StudentDetail>(`/admin/students/${studentId}/premium`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createPaymentRecord(data: CreatePaymentRequest): Promise<PaymentRecord> {
    return this.request<PaymentRecord>('/admin/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStudentPaymentHistory(studentId: string): Promise<PaymentRecord[]> {
    return this.request<PaymentRecord[]>(`/admin/students/${studentId}/payments`);
  }

  // Blob storage endpoints
  async getBlobUploadUrl(fileName: string, contentType: string): Promise<BlobUploadResponse> {
    return this.request<BlobUploadResponse>('/admin/blob/upload-url', {
      method: 'POST',
      body: JSON.stringify({ fileName, contentType }),
    });
  }

  async uploadToBlob(blobUrl: string, file: File): Promise<void> {
    const response = await fetch(blobUrl, {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }
  }

  // Quiz creation endpoints
  async createQuiz(quizData: CreateQuizRequest): Promise<Quiz> {
    return this.request<Quiz>('/admin/quiz', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    return this.request<Quiz[]>('/admin/quiz');
  }

  async updateQuiz(quizId: string, quizData: CreateQuizRequest): Promise<Quiz> {
    return this.request<Quiz>(`/admin/quiz/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    });
  }

  async deleteQuiz(quizId: string): Promise<void> {
    return this.request<void>(`/admin/quiz/${quizId}`, {
      method: 'DELETE',
    });
  }

  async uploadImageToBlob(file: File): Promise<string> {
    // Get upload URL from backend
    const uploadResponse = await this.getBlobUploadUrl(file.name, file.type);
    
    // Upload file to blob storage
    await this.uploadToBlob(uploadResponse.url, file);
    
    // Return the public URL provided by the backend
    return uploadResponse.publicUrl;
  }

  // Subject Management endpoints
  async getAllSubjects(): Promise<Subject[]> {
    return this.request<Subject[]>('/subject');
  }

  async getSubjectsByCategory(category: string): Promise<Subject[]> {
    return this.request<Subject[]>(`/subject/category/${encodeURIComponent(category)}`);
  }

  async getSubjectById(id: string): Promise<Subject> {
    return this.request<Subject>(`/subject/${id}`);
  }

  async createSubject(subjectData: CreateSubjectRequest): Promise<Subject> {
    return this.request<Subject>('/subject', {
      method: 'POST',
      body: JSON.stringify(subjectData),
    });
  }

  async updateSubject(id: string, subjectData: UpdateSubjectRequest): Promise<Subject> {
    return this.request<Subject>(`/subject/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subjectData),
    });
  }

  async deleteSubject(id: string): Promise<void> {
    return this.request<void>(`/subject/${id}`, {
      method: 'DELETE',
    });
  }

  async checkQuizAccess(subject: string, quizId: string): Promise<QuizAccess> {
    return this.request<QuizAccess>(`/subject/check-access/${encodeURIComponent(subject)}/${quizId}`);
  }

  // System Settings endpoints
  // For students - read-only access
  async getSystemSettings(): Promise<SystemSettings> {
    return this.request<SystemSettings>('/settings');
  }

  // For admins - read settings
  async getAdminSystemSettings(): Promise<SystemSettings> {
    return this.request<SystemSettings>('/admin/settings');
  }

  // For admins - update settings
  async updateSystemSettings(settings: UpdateSystemSettingsRequest): Promise<SystemSettings> {
    return this.request<SystemSettings>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export const apiService = new ApiService();
