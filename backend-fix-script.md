# Backend Fix Script for Database Table Names

## Issue Analysis
The error "Invalid object name 'Quizzes'" indicates that the backend is looking for a table named "Quizzes" but the actual table name is "Quiz" (singular).

## 1. Database Context Fix

Update your `ApplicationDbContext.cs file:

```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Quiz> Quiz { get; set; }  // Changed from Quizzes to Quiz
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

        // Quiz configuration - IMPORTANT: Set table name explicitly
        modelBuilder.Entity<Quiz>(entity =>
        {
            entity.ToTable("Quiz"); // Explicitly set table name
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
            entity.ToTable("Question"); // Explicitly set table name
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
            entity.ToTable("QuizAttempt"); // Explicitly set table name
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User).WithMany().HasForeignKey(e => e.UserId);
            entity.HasOne(e => e.Quiz).WithMany().HasForeignKey(e => e.QuizId);
            entity.HasMany(e => e.Answers).WithOne(e => e.QuizAttempt).HasForeignKey(e => e.QuizAttemptId);
        });

        // QuizAnswer configuration
        modelBuilder.Entity<QuizAnswer>(entity =>
        {
            entity.ToTable("QuizAnswer"); // Explicitly set table name
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Question).WithMany().HasForeignKey(e => e.QuestionId);
        });
    }
}
```

## 2. Quiz Service Implementation

Create or update your `QuizService.cs`:

```csharp
public class QuizService : IQuizService
{
    private readonly ApplicationDbContext _context;

    public QuizService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<QuizBundleDto>> GetQuizBundlesAsync(string grade, string medium, string subject, string type)
    {
        try
        {
            var query = _context.Quiz.AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(grade))
                query = query.Where(q => q.Grade == grade);
            
            if (!string.IsNullOrEmpty(medium))
                query = query.Where(q => q.Medium == medium);
            
            if (!string.IsNullOrEmpty(subject))
                query = query.Where(q => q.Subject == subject);
            
            if (!string.IsNullOrEmpty(type))
                query = query.Where(q => q.Type == type);

            var quizzes = await query
                .Where(q => q.IsActive)
                .Include(q => q.Questions)
                .ToListAsync();

            // Group quizzes into bundles by year and type
            var bundles = quizzes
                .GroupBy(q => new { q.Year, q.Type })
                .Select(g => new QuizBundleDto
                {
                    Id = $"{g.Key.Type}-{g.Key.Year}",
                    Title = $"{g.Key.Year} {g.Key.Type}",
                    Description = $"Complete set of {g.Key.Year} {g.Key.Type}",
                    Year = g.Key.Year.ToString(),
                    PaperCount = g.Count(),
                    Difficulty = g.First().Difficulty,
                    Thumbnail = null,
                    Quizzes = g.Select(q => new QuizDto
                    {
                        Id = q.Id.ToString(),
                        Title = q.Title,
                        Description = q.Description,
                        Grade = q.Grade,
                        Medium = q.Medium,
                        Subject = q.Subject,
                        Type = q.Type,
                        TimeLimit = q.TimeLimit,
                        Difficulty = q.Difficulty,
                        Year = q.Year,
                        QuestionCount = q.Questions.Count,
                        IsActive = q.IsActive,
                        CreatedAt = q.CreatedAt.ToString("yyyy-MM-dd")
                    }).ToList()
                })
                .ToList();

            return bundles;
        }
        catch (Exception ex)
        {
            // Log the exception
            Console.WriteLine($"Error in GetQuizBundlesAsync: {ex.Message}");
            throw new Exception($"Failed to retrieve quiz bundles: {ex.Message}");
        }
    }

    public async Task<QuizDto?> GetQuizByIdAsync(Guid id)
    {
        try
        {
            var quiz = await _context.Quiz
                .Include(q => q.Questions)
                .FirstOrDefaultAsync(q => q.Id == id && q.IsActive);

            if (quiz == null) return null;

            return new QuizDto
            {
                Id = quiz.Id.ToString(),
                Title = quiz.Title,
                Description = quiz.Description,
                Grade = quiz.Grade,
                Medium = quiz.Medium,
                Subject = quiz.Subject,
                Type = quiz.Type,
                TimeLimit = quiz.TimeLimit,
                Difficulty = quiz.Difficulty,
                Year = quiz.Year,
                QuestionCount = quiz.Questions.Count,
                IsActive = quiz.IsActive,
                CreatedAt = quiz.CreatedAt.ToString("yyyy-MM-dd")
            };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetQuizByIdAsync: {ex.Message}");
            throw new Exception($"Failed to retrieve quiz: {ex.Message}");
        }
    }

    public async Task<List<QuizDto>> SearchQuizzesAsync(string query)
    {
        try
        {
            var quizzes = await _context.Quiz
                .Where(q => q.IsActive && 
                    (q.Title.Contains(query) || 
                     q.Description.Contains(query) ||
                     q.Subject.Contains(query)))
                .Include(q => q.Questions)
                .ToListAsync();

            return quizzes.Select(q => new QuizDto
            {
                Id = q.Id.ToString(),
                Title = q.Title,
                Description = q.Description,
                Grade = q.Grade,
                Medium = q.Medium,
                Subject = q.Subject,
                Type = q.Type,
                TimeLimit = q.TimeLimit,
                Difficulty = q.Difficulty,
                Year = q.Year,
                QuestionCount = q.Questions.Count,
                IsActive = q.IsActive,
                CreatedAt = q.CreatedAt.ToString("yyyy-MM-dd")
            }).ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in SearchQuizzesAsync: {ex.Message}");
            throw new Exception($"Failed to search quizzes: {ex.Message}");
        }
    }
}
```

## 3. Database Migration Script

Create a new migration to ensure proper table names:

```bash
# In your backend project directory
dotnet ef migrations add FixTableNames
dotnet ef database update
```

## 4. Alternative: Manual Database Table Creation

If you prefer to create tables manually, use this SQL script:

```sql
-- Create Quiz table
CREATE TABLE [dbo].[Quiz] (
    [Id] uniqueidentifier NOT NULL PRIMARY KEY,
    [Title] nvarchar(255) NOT NULL,
    [Description] nvarchar(max) NULL,
    [Grade] nvarchar(50) NOT NULL,
    [Medium] nvarchar(50) NOT NULL,
    [Subject] nvarchar(100) NOT NULL,
    [Type] nvarchar(50) NOT NULL,
    [TimeLimit] int NOT NULL,
    [Difficulty] nvarchar(50) NOT NULL,
    [Year] int NOT NULL,
    [IsActive] bit NOT NULL,
    [CreatedAt] datetime2 NOT NULL,
    [CreatedBy] uniqueidentifier NOT NULL
);

-- Create Question table
CREATE TABLE [dbo].[Question] (
    [Id] uniqueidentifier NOT NULL PRIMARY KEY,
    [QuizId] uniqueidentifier NOT NULL,
    [QuestionText] nvarchar(max) NOT NULL,
    [Options] nvarchar(max) NOT NULL,
    [CorrectAnswerIndex] int NOT NULL,
    [Explanation] nvarchar(max) NULL,
    [Order] int NOT NULL,
    FOREIGN KEY ([QuizId]) REFERENCES [Quiz]([Id])
);

-- Create QuizAttempt table
CREATE TABLE [dbo].[QuizAttempt] (
    [Id] uniqueidentifier NOT NULL PRIMARY KEY,
    [UserId] uniqueidentifier NOT NULL,
    [QuizId] uniqueidentifier NOT NULL,
    [StartedAt] datetime2 NOT NULL,
    [CompletedAt] datetime2 NULL,
    [TimeSpent] int NOT NULL,
    [Score] int NOT NULL,
    [TotalQuestions] int NOT NULL,
    [CorrectAnswers] int NOT NULL,
    [Status] nvarchar(50) NOT NULL,
    FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]),
    FOREIGN KEY ([QuizId]) REFERENCES [Quiz]([Id])
);

-- Create QuizAnswer table
CREATE TABLE [dbo].[QuizAnswer] (
    [Id] uniqueidentifier NOT NULL PRIMARY KEY,
    [QuizAttemptId] uniqueidentifier NOT NULL,
    [QuestionId] uniqueidentifier NOT NULL,
    [SelectedAnswerIndex] int NOT NULL,
    [IsCorrect] bit NOT NULL,
    [AnsweredAt] datetime2 NOT NULL,
    FOREIGN KEY ([QuizAttemptId]) REFERENCES [QuizAttempt]([Id]),
    FOREIGN KEY ([QuestionId]) REFERENCES [Question]([Id])
);
```

## 5. Sample Data Insert Script

Add some sample data to test:

```sql
-- Insert sample quiz data
INSERT INTO [Quiz] ([Id], [Title], [Description], [Grade], [Medium], [Subject], [Type], [TimeLimit], [Difficulty], [Year], [IsActive], [CreatedAt], [CreatedBy])
VALUES 
(NEWID(), '2023 O/L Mathematics Past Paper', 'Official 2023 O/L Mathematics past paper', 'grade-10', 'english', 'mathematics', 'past-papers', 60, 'Advanced', 2023, 1, GETDATE(), NEWID()),
(NEWID(), '2023 O/L Science Past Paper', 'Official 2023 O/L Science past paper', 'grade-10', 'english', 'science', 'past-papers', 60, 'Advanced', 2023, 1, GETDATE(), NEWID()),
(NEWID(), '2023 O/L ICT Past Paper', 'Official 2023 O/L ICT past paper', 'grade-10', 'english', 'ict', 'past-papers', 60, 'Advanced', 2023, 1, GETDATE(), NEWID()),
(NEWID(), 'Model Paper Set 1 - Mathematics', 'Expert-designed mathematics model paper', 'grade-10', 'english', 'mathematics', 'model-papers', 45, 'Intermediate', 2024, 1, GETDATE(), NEWID()),
(NEWID(), 'Model Paper Set 1 - Science', 'Expert-designed science model paper', 'grade-10', 'english', 'science', 'model-papers', 45, 'Intermediate', 2024, 1, GETDATE(), NEWID()),
(NEWID(), 'Model Paper Set 1 - ICT', 'Expert-designed ICT model paper', 'grade-10', 'english', 'ict', 'model-papers', 45, 'Intermediate', 2024, 1, GETDATE(), NEWID());
```

## 6. QuizController Fix

Update your QuizController to handle the empty type parameter:

```csharp
[HttpGet("bundles")]
public async Task<ActionResult<List<QuizBundleDto>>> GetQuizBundles(
    [FromQuery] string grade,
    [FromQuery] string medium,
    [FromQuery] string subject,
    [FromQuery] string type = "")
{
    try
    {
        // Handle empty type parameter
        var typeFilter = string.IsNullOrEmpty(type) ? null : type;
        
        var bundles = await _quizService.GetQuizBundlesAsync(grade, medium, subject, typeFilter);
        return Ok(bundles);
    }
    catch (Exception ex)
    {
        return BadRequest($"Error retrieving quiz bundles: {ex.Message}");
    }
}
```

## 7. Connection String Check

Make sure your connection string is correct in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=IslandFirstQuiz;Trusted_Connection=true;MultipleActiveResultSets=true"
  }
}
```

## 8. Key Changes Summary

1. **Table Names**: Changed from "Quizzes" to "Quiz" (singular)
2. **Explicit Table Mapping**: Added `.ToTable()` calls in model configuration
3. **Error Handling**: Added proper try-catch blocks in service methods
4. **Parameter Handling**: Handle empty type parameter in controller
5. **Database Structure**: Ensure proper foreign key relationships

## 9. Testing Steps

1. Apply the database migration or run the SQL scripts
2. Insert sample data
3. Test the API endpoint: `GET /api/quiz/bundles?grade=grade-10&medium=english&subject=ict&type=`
4. Check that the response returns quiz bundles instead of 400 error

The main issue was the table name mismatch. The backend was looking for "Quizzes" but the actual table name should be "Quiz" (singular).
