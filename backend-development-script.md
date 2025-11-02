# Backend Development Script for Island First Quiz Platform

## Overview
This script contains all the backend API endpoints, models, and functionality needed to support the frontend features implemented in the Island First Quiz Platform.

## 1. Database Models

### User Model
```csharp
public class User
{
    public Guid Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public int Role { get; set; } // 0 = Student, 1 = Teacher, 2 = Admin
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
    public string PasswordHash { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }
}
```

### Quiz Model
```csharp
public class Quiz
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Grade { get; set; }
    public string Medium { get; set; }
    public string Subject { get; set; }
    public string Type { get; set; } // Past Papers, Model Papers, School Papers
    public int TimeLimit { get; set; } // in minutes
    public string Difficulty { get; set; } // Beginner, Intermediate, Advanced
    public int Year { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid CreatedBy { get; set; }
    public List<Question> Questions { get; set; } = new();
}
```

### Question Model
```csharp
public class Question
{
    public Guid Id { get; set; }
    public Guid QuizId { get; set; }
    public string QuestionText { get; set; }
    public List<string> Options { get; set; } = new();
    public int CorrectAnswerIndex { get; set; }
    public string? Explanation { get; set; }
    public int Order { get; set; }
    public Quiz Quiz { get; set; }
}
```

### QuizAttempt Model
```csharp
public class QuizAttempt
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid QuizId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int TimeSpent { get; set; } // in minutes
    public int Score { get; set; } // percentage
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public string Status { get; set; } // InProgress, Completed, Abandoned
    public List<QuizAnswer> Answers { get; set; } = new();
    public User User { get; set; }
    public Quiz Quiz { get; set; }
}
```

### QuizAnswer Model
```csharp
public class QuizAnswer
{
    public Guid Id { get; set; }
    public Guid QuizAttemptId { get; set; }
    public Guid QuestionId { get; set; }
    public int SelectedAnswerIndex { get; set; }
    public bool IsCorrect { get; set; }
    public DateTime AnsweredAt { get; set; }
    public QuizAttempt QuizAttempt { get; set; }
    public Question Question { get; set; }
}
```

## 2. DTOs (Data Transfer Objects)

### Auth DTOs
```csharp
public class LoginRequest
{
    public string Email { get; set; }
    public string Password { get; set; }
}

public class RegisterRequest
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public int Role { get; set; }
}

public class AuthResponse
{
    public string Token { get; set; }
    public string RefreshToken { get; set; }
    public DateTime ExpiresAt { get; set; }
    public UserDto User { get; set; }
}

public class UserDto
{
    public Guid Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public int Role { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}
```

### Quiz DTOs
```csharp
public class QuizDto
{
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Grade { get; set; }
    public string Medium { get; set; }
    public string Subject { get; set; }
    public string Type { get; set; }
    public int TimeLimit { get; set; }
    public string Difficulty { get; set; }
    public int Year { get; set; }
    public int QuestionCount { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class QuizBundleDto
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Year { get; set; }
    public int PaperCount { get; set; }
    public string Difficulty { get; set; }
    public string? Thumbnail { get; set; }
    public List<QuizDto> Quizzes { get; set; } = new();
}

public class QuizAttemptDto
{
    public Guid Id { get; set; }
    public string QuizTitle { get; set; }
    public string Subject { get; set; }
    public string Grade { get; set; }
    public string Medium { get; set; }
    public string Type { get; set; }
    public DateTime CompletedDate { get; set; }
    public int Score { get; set; }
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public int TimeSpent { get; set; }
    public int TimeLimit { get; set; }
    public string Difficulty { get; set; }
    public string Status { get; set; }
}

public class TimeAnalyticsDto
{
    public int TotalTime { get; set; }
    public List<DailyTimeDto> Daily { get; set; } = new();
    public List<WeeklyTimeDto> Weekly { get; set; } = new();
    public List<MonthlyTimeDto> Monthly { get; set; } = new();
    public List<SubjectTimeDto> SubjectBreakdown { get; set; } = new();
    public List<TypeTimeDto> TypeBreakdown { get; set; } = new();
    public List<RecentActivityDto> RecentActivity { get; set; } = new();
}

public class DailyTimeDto
{
    public string Day { get; set; }
    public int Time { get; set; }
    public string Subject { get; set; }
}

public class WeeklyTimeDto
{
    public string Week { get; set; }
    public int Time { get; set; }
    public int Quizzes { get; set; }
}

public class MonthlyTimeDto
{
    public string Month { get; set; }
    public int Time { get; set; }
    public int Quizzes { get; set; }
}

public class SubjectTimeDto
{
    public string Name { get; set; }
    public int Value { get; set; }
    public string Color { get; set; }
    public int Percentage { get; set; }
}

public class TypeTimeDto
{
    public string Name { get; set; }
    public int Value { get; set; }
    public string Color { get; set; }
    public int Percentage { get; set; }
}

public class RecentActivityDto
{
    public string Time { get; set; }
    public string Subject { get; set; }
    public int Duration { get; set; }
    public string Type { get; set; }
}
```

## 3. API Controllers

### AuthController
```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var result = await _authService.LoginAsync(request.Email, request.Password);
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid credentials");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var result = await _authService.RefreshTokenAsync(request.Token, request.RefreshToken);
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized("Invalid refresh token");
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId != null)
        {
            await _authService.LogoutAsync(Guid.Parse(userId));
        }
        return Ok();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var user = await _authService.GetCurrentUserAsync(Guid.Parse(userId));
        return Ok(user);
    }
}
```

### QuizController
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QuizController : ControllerBase
{
    private readonly IQuizService _quizService;

    public QuizController(IQuizService quizService)
    {
        _quizService = quizService;
    }

    [HttpGet("bundles")]
    public async Task<ActionResult<List<QuizBundleDto>>> GetQuizBundles(
        [FromQuery] string grade,
        [FromQuery] string medium,
        [FromQuery] string subject,
        [FromQuery] string type)
    {
        var bundles = await _quizService.GetQuizBundlesAsync(grade, medium, subject, type);
        return Ok(bundles);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<QuizDto>> GetQuiz(Guid id)
    {
        var quiz = await _quizService.GetQuizByIdAsync(id);
        if (quiz == null) return NotFound();
        return Ok(quiz);
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<QuizDto>>> SearchQuizzes([FromQuery] string query)
    {
        var quizzes = await _quizService.SearchQuizzesAsync(query);
        return Ok(quizzes);
    }
}
```

### QuizAttemptController
```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class QuizAttemptController : ControllerBase
{
    private readonly IQuizAttemptService _quizAttemptService;

    public QuizAttemptController(IQuizAttemptService quizAttemptService)
    {
        _quizAttemptService = quizAttemptService;
    }

    [HttpPost("start")]
    public async Task<ActionResult<Guid>> StartQuiz([FromBody] StartQuizRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var attemptId = await _quizAttemptService.StartQuizAsync(Guid.Parse(userId), request.QuizId);
        return Ok(attemptId);
    }

    [HttpPost("{attemptId}/answer")]
    public async Task<IActionResult> SubmitAnswer(Guid attemptId, [FromBody] SubmitAnswerRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        await _quizAttemptService.SubmitAnswerAsync(attemptId, request.QuestionId, request.SelectedAnswerIndex);
        return Ok();
    }

    [HttpPost("{attemptId}/complete")]
    public async Task<ActionResult<QuizAttemptDto>> CompleteQuiz(Guid attemptId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var result = await _quizAttemptService.CompleteQuizAsync(attemptId);
        return Ok(result);
    }

    [HttpGet("completed")]
    public async Task<ActionResult<List<QuizAttemptDto>>> GetCompletedQuizzes()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var attempts = await _quizAttemptService.GetCompletedQuizzesAsync(Guid.Parse(userId));
        return Ok(attempts);
    }

    [HttpGet("time-analytics")]
    public async Task<ActionResult<TimeAnalyticsDto>> GetTimeAnalytics()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var analytics = await _quizAttemptService.GetTimeAnalyticsAsync(Guid.Parse(userId));
        return Ok(analytics);
    }
}
```

## 4. Services

### IAuthService
```csharp
public interface IAuthService
{
    Task<AuthResponse> LoginAsync(string email, string password);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> RefreshTokenAsync(string token, string refreshToken);
    Task LogoutAsync(Guid userId);
    Task<UserDto> GetCurrentUserAsync(Guid userId);
}
```

### IQuizService
```csharp
public interface IQuizService
{
    Task<List<QuizBundleDto>> GetQuizBundlesAsync(string grade, string medium, string subject, string type);
    Task<QuizDto?> GetQuizByIdAsync(Guid id);
    Task<List<QuizDto>> SearchQuizzesAsync(string query);
}
```

### IQuizAttemptService
```csharp
public interface IQuizAttemptService
{
    Task<Guid> StartQuizAsync(Guid userId, Guid quizId);
    Task SubmitAnswerAsync(Guid attemptId, Guid questionId, int selectedAnswerIndex);
    Task<QuizAttemptDto> CompleteQuizAsync(Guid attemptId);
    Task<List<QuizAttemptDto>> GetCompletedQuizzesAsync(Guid userId);
    Task<TimeAnalyticsDto> GetTimeAnalyticsAsync(Guid userId);
}
```

## 5. Database Context

```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Quiz> Quizzes { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<QuizAttempt> QuizAttempts { get; set; }
    public DbSet<QuizAnswer> QuizAnswers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Role).IsRequired();
        });

        // Quiz configuration
        modelBuilder.Entity<Quiz>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Grade).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Medium).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Subject).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.HasMany(e => e.Questions).WithOne(e => e.Quiz).HasForeignKey(e => e.QuizId);
        });

        // Question configuration
        modelBuilder.Entity<Question>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.QuestionText).IsRequired();
            entity.Property(e => e.Options).HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null)
            );
        });

        // QuizAttempt configuration
        modelBuilder.Entity<QuizAttempt>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId);
            entity.HasOne(e => e.Quiz).WithMany().HasForeignKey(e => e.QuizId);
            entity.HasMany(e => e.Answers).WithOne(e => e.QuizAttempt).HasForeignKey(e => e.QuizAttemptId);
        });

        // QuizAnswer configuration
        modelBuilder.Entity<QuizAnswer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Question).WithMany().HasForeignKey(e => e.QuestionId);
        });
    }
}
```

## 6. JWT Configuration

```csharp
// In Program.cs or Startup.cs
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = configuration["Jwt:Issuer"],
            ValidAudience = configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["Jwt:Key"]))
        };
    });

services.AddAuthorization();
```

## 7. CORS Configuration

```csharp
services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", builder =>
    {
        builder.WithOrigins("http://localhost:8080", "https://localhost:8080")
               .AllowAnyHeader()
               .AllowAnyMethod()
               .AllowCredentials();
    });
});
```

## 8. API Endpoints Summary

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Quiz Management
- `GET /api/quiz/bundles` - Get quiz bundles by filters
- `GET /api/quiz/{id}` - Get specific quiz
- `GET /api/quiz/search` - Search quizzes

### Quiz Attempts
- `POST /api/quizattempt/start` - Start a quiz
- `POST /api/quizattempt/{attemptId}/answer` - Submit answer
- `POST /api/quizattempt/{attemptId}/complete` - Complete quiz
- `GET /api/quizattempt/completed` - Get completed quizzes
- `GET /api/quizattempt/time-analytics` - Get time analytics

## 9. Environment Variables

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=IslandFirstQuiz;Trusted_Connection=true;MultipleActiveResultSets=true"
  },
  "Jwt": {
    "Key": "YourSuperSecretKeyThatIsAtLeast32CharactersLong",
    "Issuer": "IslandFirst",
    "Audience": "IslandFirstUsers"
  },
  "AllowedHosts": "*"
}
```

## 10. Required NuGet Packages

```xml
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="7.0.0" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="7.0.0" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="7.0.0" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="7.0.0" />
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
```

This script provides all the necessary backend components to support the frontend features. Copy and paste this into your backend Cursor to implement the complete API functionality.
