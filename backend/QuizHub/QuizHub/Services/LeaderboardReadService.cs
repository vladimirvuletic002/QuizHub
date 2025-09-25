using Microsoft.EntityFrameworkCore;
using QuizHub.Dto;
using QuizHub.Infrastructure;
using QuizHub.Interfaces;

namespace QuizHub.Services
{
    public class LeaderboardReadService : ILeaderboardReadService
    {
        private readonly QuizDbContext _db;
        public LeaderboardReadService(QuizDbContext db) { _db = db; }

        public async Task<LeaderboardRowDto?> GetMyPlacementdAsync(long quizId, long userId)
        {
            var me = await _db.QuizLeaderboards
                .AsNoTracking()
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.QuizId == quizId && x.UserId == userId);

            if (me == null) return null;

            return new LeaderboardRowDto
            {
                UserId = me.UserId,
                Username = me.User.Username,
                Score = me.Score,
                MaxScore = me.MaxScore,
                DurationSeconds = me.DurationSeconds,
                CompletedAtUtc = me.CompletedAtUtc
            };
        }

        public async Task<List<LeaderboardRowDto>> GetQuizLeaderboardAsync(long quizId, int page = 1, int pageSize = 50)
        {
            page = Math.Max(page, 1);
            pageSize = Math.Clamp(pageSize, 1, 100);

            // sortiranje po pravilima
            var baseQuery = _db.QuizLeaderboards
                .AsNoTracking()
                .Where(x => x.QuizId == quizId)
                .Include(x => x.User)
                .OrderByDescending(x => x.Score)
                .ThenBy(x => x.DurationSeconds ?? int.MaxValue)
                .ThenBy(x => x.CompletedAtUtc);

            // Ako hoćeš "rank" server-side: izračunaj ga ručno (EF nema ROW_NUMBER lako portabilno)
            // Jednostavno rešenje: uzmi prvih page * pageSize, pa rangiraj u memoriji.
            var takeCount = page * pageSize;
            var slice = await baseQuery.Take(takeCount).ToListAsync();

            int rank = 0;
            int prevScore = int.MinValue;
            int? prevDur = null;
            DateTime prevWhen = DateTime.MinValue;
            int seen = 0;

            var ranked = new List<LeaderboardRowDto>(slice.Count);
            foreach (var r in slice)
            {
                seen++;
                bool sameAsPrev = (r.Score == prevScore) &&
                                  ((r.DurationSeconds ?? int.MaxValue) == (prevDur ?? int.MaxValue)) &&
                                  (r.CompletedAtUtc == prevWhen);

                if (!sameAsPrev)
                {
                    rank = seen; // competition ranking
                    prevScore = r.Score;
                    prevDur = r.DurationSeconds;
                    prevWhen = r.CompletedAtUtc;
                }

                ranked.Add(new LeaderboardRowDto
                {
                    UserId = r.UserId,
                    Username = r.User.Username,
                    Score = r.Score,
                    MaxScore = r.MaxScore,
                    DurationSeconds = r.DurationSeconds,
                    AttemptId = r.AttemptId,
                    CompletedAtUtc = r.CompletedAtUtc,
                    Rank = rank
                });
            }

            // vrati samo stranu
            return ranked.Skip((page - 1) * pageSize).Take(pageSize).ToList();
        }
    }
}
