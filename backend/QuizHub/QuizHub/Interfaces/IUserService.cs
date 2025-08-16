using QuizHub.Dto;

namespace QuizHub.Interfaces
{
    public interface IUserService
    {
        List<UserDto> GetUsers();
        UserDto GetUser(long id);
    }
}
