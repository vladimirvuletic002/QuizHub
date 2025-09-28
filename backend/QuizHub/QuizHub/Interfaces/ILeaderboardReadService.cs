using QuizHub.Dto.Leaderboard;

namespace QuizHub.Interfaces
{
    public interface ILeaderboardReadService
    {
        Task<List<LeaderboardRowDto>> GetQuizLeaderboardAsync(long quizId, int page = 1, int pageSize = 50);

        Task<LeaderboardRowDto?> GetMyPlacementdAsync(long quizId, long userId);
    }
}
