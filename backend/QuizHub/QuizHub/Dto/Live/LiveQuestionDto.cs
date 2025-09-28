using QuizHub.Models;

namespace QuizHub.Dto.Live
{
    public sealed class LiveQuestionDto
    {
        public long Id { get; set; }
        public string Text { get; set; } = "";
        public QuestionType Type { get; set; }
        public List<LiveOptionDto>? Options { get; set; } // null za TextInput
        public int TimeLimitSeconds { get; set; }
        public int Order { get; set; }
        public int Points { get; set; }
    }
}
