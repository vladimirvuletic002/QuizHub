using AutoMapper;
using QuizHub.Dto;
using QuizHub.Infrastructure;
using QuizHub.Interfaces;

namespace QuizHub.Services
{
    public class UserService : IUserService
    {
        private readonly IMapper _mapper;
        private readonly QuizDbContext _dbContext;

        public UserService(IMapper mapper, QuizDbContext dbContext)
        {
            _mapper = mapper;
            _dbContext = dbContext;
        }

        public UserDto GetUser(long id)
        {
            return _mapper.Map<UserDto>(_dbContext.Users.Find(id));
        }

        public List<UserDto> GetUsers()
        {
            return _mapper.Map<List<UserDto>>(_dbContext.Users.ToList());
        }
    }
}
