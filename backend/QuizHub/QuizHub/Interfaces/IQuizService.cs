using QuizHub.Dto.Quiz;

namespace QuizHub.Interfaces
{
    public interface IQuizService
    {
        Task<long> CreateQuizAsync(CreateQuizDto dto, long userId);

        Task<QuizDetailsDto?> GetQuizByIdAsync(long id);
        Task<bool> DeleteQuizAsync(long id);
        Task<bool> UpdateQuizAsync(long id, UpdateQuizDto dto);

        Task<PagedResult<QuizListItemDto>> SearchAsync(QuizQuery query);

        Task<PagedResult<QuizListItemDto>> GetAllQuizzesAsync();

        Task<List<QuizDto>> GetQuizzes();

        Task<QuizSubmitResultDto> SubmitQuizAsync(long quizId, long userId, SubmitQuizDto submission);
    }
}
