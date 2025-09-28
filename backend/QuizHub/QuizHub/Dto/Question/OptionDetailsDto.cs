namespace QuizHub.Dto.Question
{
    public class OptionDetailsDto
    {
        public long Id { get; set; }
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}
