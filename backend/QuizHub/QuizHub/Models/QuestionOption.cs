namespace QuizHub.Models
{
    public class QuestionOption
    {
        public long Id { get; set; }
        public long QuestionId { get; set; }
        public Question Question { get; set; } = default!;

        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}
