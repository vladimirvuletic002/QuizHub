namespace QuizHub.Models
{
    public class Question
    {
        public long Id { get; set; }
        public long QuizId { get; set; }
        public Quiz Quiz { get; set; } = default!;

        public string Text { get; set; } = string.Empty;
        public QuestionType Type { get; set; }

        public int Order { get; set; }             // redosled u okviru ovog kviza
        public int Points { get; set; } = 1;    
        public int? TimeLimitSeconds { get; set; } // opcioni limit po pitanju

        public ICollection<QuestionOption> Options { get; set; } = new List<QuestionOption>();
        public ICollection<QuestionAcceptableAnswer> AcceptableAnswers { get; set; } = new List<QuestionAcceptableAnswer>(); //za text-input
    }
}
