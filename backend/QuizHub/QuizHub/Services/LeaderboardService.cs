using Microsoft.EntityFrameworkCore;
using QuizHub.Infrastructure;
using QuizHub.Interfaces;
using QuizHub.Models;

namespace QuizHub.Services
{
    public class LeaderboardService : ILeaderboardService
    {
        private readonly QuizDbContext _db;
        public LeaderboardService(QuizDbContext db) => _db = db;

        public async Task InsertFirstAttemptOnlyAsync(long quizId, long userId, int score, int maxScore, int? durationSeconds, long attemptId, DateTime completedAtUtc)
        {
            // Ako red već postoji => IGNORIŠI
            var exists = await _db.QuizLeaderboards
                .AsNoTracking()
                .AnyAsync(x => x.QuizId == quizId && x.UserId == userId);

            if (exists) return;

            var percentage = (maxScore > 0) ? (score * 100.0 / maxScore) : 0.0;

            var row = new QuizLeaderboard
            {
                QuizId = quizId,
                UserId = userId,
                Score = score,
                MaxScore = maxScore,
                DurationSeconds = durationSeconds,
                AttemptId = attemptId,
                CompletedAtUtc = completedAtUtc,
            };

            _db.QuizLeaderboards.Add(row);

            // race condition zaštita: ako dva procesa istovremeno pokušaju insert,
            // rely na PK(QuizId,UserId); u tom slučaju samo progutaj duplikat
            try
            {
                await _db.SaveChangesAsync();
            }
            catch (DbUpdateException)
            {
                // neko je upisao "pre nas" – ok, naša politika je “samo prvi”, pa ne radimo ništa
            }
        }
    }
}
