using QuizHub.Dto;

namespace QuizHub.Interfaces
{
    public interface IAttemptService
    {
        Task<List<AttemptListItemDto>> GetMyAttemptsAsync(long userId);
		Task<AttemptDetailsDto> GetAttemptDetails(long attId, long userId);
		Task<List<AttemptListItemDto>> GetAllAttemptsAsync();
    }
}
