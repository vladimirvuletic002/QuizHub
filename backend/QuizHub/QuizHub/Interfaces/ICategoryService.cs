using QuizHub.Dto;

namespace QuizHub.Interfaces
{
    public interface ICategoryService
    {
        List<CategoryNameDto> GetCategories();
    }
}
