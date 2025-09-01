namespace QuizHub.Dto
{
    public class CreateOptionDto
    {
        public string Text { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
    }
}
