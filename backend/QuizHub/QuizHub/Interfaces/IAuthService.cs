using Microsoft.AspNetCore.Identity.Data;
using QuizHub.Dto;
using QuizHub.Models;

namespace QuizHub.Interfaces
{
    public interface IAuthService
    {
        Task<User> RegisterAsync(RegisterDto request);
        Task<AuthResponse> LoginAsync(LoginDto request);
    }
}
