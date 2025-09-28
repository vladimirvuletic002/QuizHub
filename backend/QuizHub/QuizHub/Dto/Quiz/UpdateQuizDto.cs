using QuizHub.Dto.Question;
using QuizHub.Models;
using System.ComponentModel.DataAnnotations;

namespace QuizHub.Dto.Quiz
{
    public class UpdateQuizDto
    {
        [Required, MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        public long CategoryId { get; set; }

        [Required]
        public DifficultyLevel Difficulty { get; set; }

        public int TimeLimitSeconds { get; set; } = 0;

        [Required, MinLength(1)]
        public List<CreateQuestionDto> Questions { get; set; } = new();
    }
}
