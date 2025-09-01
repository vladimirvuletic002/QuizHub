using System.ComponentModel.DataAnnotations;

namespace QuizHub.Models
{
    public class AttemptAnswer
    {
        public long Id { get; set; }

        public long AttemptId { get; set; }
        public QuizAttempt Attempt { get; set; } = default!;

        public long QuestionId { get; set; }
        public Question Question { get; set; } = default!;

        // za Single/Multiple/TrueFalse
        public ICollection<AttemptAnswerOption> SelectedOptions { get; set; } = new List<AttemptAnswerOption>();

        // za TextInput
        [MaxLength(100)]
        public string? TextAnswer { get; set; }

        public bool? IsCorrect { get; set; }
        public int AwardedPoints { get; set; }
    }
}
