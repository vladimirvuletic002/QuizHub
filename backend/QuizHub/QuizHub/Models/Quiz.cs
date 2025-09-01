using System.ComponentModel.DataAnnotations;

namespace QuizHub.Models
{
    public class Quiz
    {
        public long Id { get; set; }

        [MaxLength(35)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; } = string.Empty;

        public long CategoryId { get; set; }

        public Category Category { get; set; } = default!;

        public DifficultyLevel Difficulty { get; set; }

        public int TimeLimitSeconds { get; set; } 
        public int QuestionCount { get; set; }


        public ICollection<Question> Questions { get; set; } = new List<Question>();
        public ICollection<QuizAttempt>? Attempts { get; set; } = new List<QuizAttempt>();
    }
}
