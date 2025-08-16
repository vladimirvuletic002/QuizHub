using System.Security.Claims;

namespace QuizHub.Interfaces
{
    public interface IJwtTokenService
    {
        (string token, DateTime expires) CreateToken(IEnumerable<Claim> claims);
    }
}
