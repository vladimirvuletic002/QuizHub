using AutoMapper;
using QuizHub.Dto;
using QuizHub.Infrastructure;
using QuizHub.Interfaces;

namespace QuizHub.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly QuizDbContext _db;
        private readonly IMapper _mapper;

        public CategoryService(QuizDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public List<CategoryNameDto> GetCategories()
        {
            return _mapper.Map<List<CategoryNameDto>>(_db.Categories.ToList());
        }
    }
}
