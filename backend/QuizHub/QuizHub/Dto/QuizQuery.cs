using QuizHub.Models;

namespace QuizHub.Dto
{
    public class QuizQuery
    {
        public long? CategoryId { get; set; }
        public DifficultyLevel? Difficulty { get; set; }
        public string? KeyWord { get; set; } 
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }
}
