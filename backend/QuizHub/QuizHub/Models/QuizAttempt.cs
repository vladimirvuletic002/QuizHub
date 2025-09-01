namespace QuizHub.Models
{
    public class QuizAttempt
    {
        public long Id { get; set; }
        public long QuizId { get; set; }
        public Quiz Quiz { get; set; } = default!;

        public long UserId { get; set; }
        public User User { get; set; } = default!;

        public DateTime StartedAtUtc { get; set; }
        public DateTime? CompletedAtUtc { get; set; }

        public int Score { get; set; }          // konačan skor
        public int MaxScore { get; set; }       // zbir poena svih pitanja u pokušaju (radi procenta)

        public ICollection<AttemptAnswer> Answers { get; set; } = new List<AttemptAnswer>();
    }
}

