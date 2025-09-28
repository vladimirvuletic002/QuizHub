using QuizHub.Dto.Category;

namespace QuizHub.Interfaces
{
    public interface ICategoryService
    {
        List<CategoryNameDto> GetCategories();
    }
}
