using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using QuizHub.Interfaces;
using QuizHub.Options;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace QuizHub.Services
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly JwtOptions _jwt;

        public JwtTokenService(IOptions<JwtOptions> jwtOptions)
        {
            _jwt = jwtOptions.Value;
        }

        public (string token, DateTime expires) CreateToken(IEnumerable<Claim> claims)
        {
            var expires = DateTime.UtcNow.AddMinutes(_jwt.ExpiresMinutes);

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwt.Issuer,
                audience: _jwt.Audience,
                claims: claims,
                expires: expires,
                signingCredentials: creds);

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);
            return (jwt, expires);
        }
    }
}

