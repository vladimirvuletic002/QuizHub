using QuizHub.Models;

namespace QuizHub.Dto
{
    public class QuizListItemDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public DifficultyLevel Difficulty { get; set; }
        public int QuestionCount { get; set; }
        public int TimeLimitSeconds { get; set; }
    }
}
