namespace QuizHub.Dto
{
    public class LeaderboardRowDto
    {
        public long UserId { get; set; }
        public string Username { get; set; } = "";
        public int Score { get; set; }
        public int MaxScore { get; set; }
        public int? DurationSeconds { get; set; }
        public long? AttemptId { get; set; }
        public DateTime CompletedAtUtc { get; set; }
        public int Rank { get; set; } // izracunat u SELECT-u
    }
}
