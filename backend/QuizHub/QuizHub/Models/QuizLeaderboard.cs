using System.ComponentModel.DataAnnotations;

namespace QuizHub.Models
{
    public class QuizLeaderboard
    {
        public long QuizId { get; set; }
        public Quiz Quiz { get; set; } = default;

        public long UserId { get; set; }
        public User User { get; set; } = default!;

        // Agregati za leaderboard
        public int Score { get; set; }          // najbolji ostvareni skor
        public int MaxScore { get; set; }           // referentni max (radi %)
        //public double BestPercentage { get; set; }  // 0..100
        //public int AttemptsCount { get; set; }      // broj odigranih pokušaja

        public int? DurationSeconds { get; set; } // vreme za najbolji skor (tie-break)
        public long? AttemptId { get; set; }
        public DateTime CompletedAtUtc { get; set; }     // kada je postignut skor
    }
}


