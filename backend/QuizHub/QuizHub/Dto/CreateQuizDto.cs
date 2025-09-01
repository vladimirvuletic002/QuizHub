using QuizHub.Models;

namespace QuizHub.Dto
{
    public class CreateQuizDto
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public long CategoryId { get; set; }
        public DifficultyLevel Difficulty { get; set; }
        public int TimeLimitSeconds { get; set; }

        public List<CreateQuestionDto> Questions { get; set; } = new();
    }
}
