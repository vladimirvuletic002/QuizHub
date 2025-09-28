using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.EntityFrameworkCore;
using QuizHub.Dto.Auth;
using QuizHub.Infrastructure;
using QuizHub.Interfaces;
using QuizHub.Models;
using System.Security.Claims;

namespace QuizHub.Services
{
    public class AuthService : IAuthService
    {
        private readonly IMapper _mapper;
        private readonly QuizDbContext _db;
        private readonly PasswordHasher<User> _hasher = new();
        private readonly IJwtTokenService _jwt;

        public AuthService(IMapper mapper, QuizDbContext db, IJwtTokenService jwt)
        {
            _mapper = mapper;
            _db = db;
            _jwt = jwt;
        }

        public async Task<User> RegisterAsync(RegisterDto request)
        {
            // jedinstvenost
            if (await _db.Users.AnyAsync(u => u.Username == request.Username))
                throw new InvalidOperationException("Username already taken.");

            if (await _db.Users.AnyAsync(u => u.Email == request.Email))
                throw new InvalidOperationException("Email already in use.");

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                UserType = UserType.User
            }; 

            //User user = _mapper.Map<User>(request);
            

            // slika: multipart/form-data ima prioritet
            if (request.ProfileImage != null && request.ProfileImage.Length > 0)
            {
                using var ms = new System.IO.MemoryStream();
                await request.ProfileImage.CopyToAsync(ms);
                user.ProfileImage = ms.ToArray();
                user.ProfileImageContentType = request.ProfileImage.ContentType;
            }
            /*else if (!string.IsNullOrWhiteSpace(request.ProfileImageBase64))
            {
                var payload = request.ProfileImageBase64;
                var comma = payload.IndexOf(',');
                if (comma >= 0) payload = payload[(comma + 1)..];
                user.ProfileImage = Convert.FromBase64String(payload);
                user.ProfileImageContentType = request.ProfileImageContentType;
            } */

            user.Password = _hasher.HashPassword(user, request.Password);

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return user;
        }

        public async Task<AuthResponse> LoginAsync(LoginDto request)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u =>
                u.Username == request.UsernameOrEmail || u.Email == request.UsernameOrEmail);

            if (user == null)
                throw new UnauthorizedAccessException("Invalid credentials.");

            var result = _hasher.VerifyHashedPassword(user, user.Password, request.Password);
            if (result == PasswordVerificationResult.Failed)
                throw new UnauthorizedAccessException("Invalid credentials.");

            await _db.SaveChangesAsync();

            return MakeAuthResponse(user);
        }

        private AuthResponse MakeAuthResponse(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.UserType.ToString())
            };

            var (token, expires) = _jwt.CreateToken(claims);

            /*string? profileImageBase64 = null;
            if (user.ProfileImage != null && user.ProfileImage.Length > 0)
            {
                profileImageBase64 = $"data:image/png;base64,{Convert.ToBase64String(user.ProfileImage)}";
            }*/

            return new AuthResponse
            {
                UserId = user.Id,
                Username = user.Username,
                Email = user.Email,
                //ProfileImageBase64 = profileImageBase64,
                Role = user.UserType.ToString(),
                Token = token,
                ExpiresAtUtc = expires
            };
        }
    }
}

