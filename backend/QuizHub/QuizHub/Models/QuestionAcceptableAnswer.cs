namespace QuizHub.Models
{
    public class QuestionAcceptableAnswer
    {
        public long Id { get; set; }
        public long QuestionId { get; set; }
        public Question Question { get; set; } = default!;
        public string AnswerText { get; set; } = string.Empty;
    }
}
