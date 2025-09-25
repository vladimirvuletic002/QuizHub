namespace QuizHub.Interfaces
{
    public interface ILeaderboardService
    {
        Task InsertFirstAttemptOnlyAsync(
        long quizId,
        long userId,
        int score,
        int maxScore,
        int? durationSeconds,
        long attemptId,
        DateTime completedAtUtc);
    }
}
