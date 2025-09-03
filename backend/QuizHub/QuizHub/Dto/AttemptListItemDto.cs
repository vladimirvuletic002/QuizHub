namespace QuizHub.Dto
{
    public class AttemptListItemDto
    {
        public long AttemptId { get; set; }
        public long QuizId { get; set; }
        public string QuizTitle { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;

        public DateTime StartedAtUtc { get; set; }
        public DateTime? CompletedAtUtc { get; set; }
        public int DurationSeconds { get; set; }      // (Completed - Started) u sekundama (ako postoji Completed)

        public int Score { get; set; }
        public int MaxScore { get; set; }
        public double Percentage { get; set; }        // 0..100

        //public List<AttemptQuestionDetailDto>? Questions { get; set; } = new();
        
    }
}
