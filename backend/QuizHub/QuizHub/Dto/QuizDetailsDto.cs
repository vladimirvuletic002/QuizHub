using QuizHub.Models;

namespace QuizHub.Dto
{
    public class QuizDetailsDto
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DifficultyLevel Difficulty { get; set; }
        public int TimeLimitSeconds { get; set; }
        public long CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int QuestionCount { get; set; }
        public List<QuestionDetailsDto> Questions { get; set; } = new();
    }
}
