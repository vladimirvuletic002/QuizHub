using QuizHub.Models;

namespace QuizHub.Dto
{
    public class QuestionDetailsDto
    {
        public long Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public QuestionType Type { get; set; }
        public int Order { get; set; }
        public int Points { get; set; }
        public int? TimeLimitSeconds { get; set; }

        public List<OptionDetailsDto>? Options { get; set; }        // za izborna
        public List<string>? AcceptableAnswers { get; set; }         // za text input
    }
}
