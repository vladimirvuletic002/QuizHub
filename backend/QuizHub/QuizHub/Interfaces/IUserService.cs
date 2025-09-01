using QuizHub.Dto;

namespace QuizHub.Interfaces
{
    public interface IUserService
    {
        List<UserDto> GetUsers();
        UserDto GetUser(long id);

        Task<(byte[] Content, string ContentType)?> GetProfileImage(long id);
    }
}
