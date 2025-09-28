using QuizHub.Models;

namespace QuizHub.Dto.Quiz
{
    public class QuizDto
    {
        public string Title { get; set; } = string.Empty;

        public long CategoryId { get; set; }

        public DifficultyLevel Difficulty { get; set; }
        public int TimeLimitSeconds { get; set; }
    }
}
