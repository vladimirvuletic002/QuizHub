namespace QuizHub.Models
{
    public class AttemptAnswerOption
    {
        public long AttemptAnswerId { get; set; }
        public AttemptAnswer AttemptAnswer { get; set; } = default!;

        public long QuestionOptionId { get; set; }
        public QuestionOption QuestionOption { get; set; } = default!;
    }
}
