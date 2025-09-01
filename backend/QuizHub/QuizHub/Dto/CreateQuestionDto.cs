using QuizHub.Models;

namespace QuizHub.Dto
{
    public class CreateQuestionDto
    {
        public string Text { get; set; } = string.Empty;
        public QuestionType Type { get; set; }
        public int Order { get; set; }
        public int Points { get; set; } = 1;
        public int? TimeLimitSeconds { get; set; }

        // za izborna pitanja (Single/Multiple/TrueFalse)
        public List<CreateOptionDto>? Options { get; set; }

        // za TextInput
        public List<string>? AcceptableAnswers { get; set; }
    }
}
