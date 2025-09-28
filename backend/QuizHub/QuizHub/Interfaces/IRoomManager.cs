namespace QuizHub.Interfaces
{
    public interface IRoomManager
    {
        Task CreateRoomAsync(string roomCode, long quizId, long adminUserId, string adminName, int revealSeconds = 5);
        Task AddParticipantAsync(string roomCode, long userId, string username, bool isAdmin, string connectionId);
        Task RemoveConnectionAsync(string roomCode, string connectionId);
        Task StartQuizAsync(string roomCode, long adminUserId);
        Task SubmitAsync(string roomCode, long userId, long questionId, object payload);
    }
}
