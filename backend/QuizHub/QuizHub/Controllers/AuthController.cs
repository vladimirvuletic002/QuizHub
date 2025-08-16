using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using QuizHub.Dto;
using QuizHub.Interfaces;

namespace QuizHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;

        public AuthController(IAuthService auth)
        {
            _auth = auth;
        }

        // multipart/form-data registracija (sa fajlom) ili JSON
        [HttpPost("register")]
        [Consumes("multipart/form-data", "application/json")]
        public async Task<IActionResult> Register([FromForm] RegisterDto formRequest)
        {
            try
            {
                var res = await _auth.RegisterAsync(formRequest);
                return Ok(res);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            try
            {
                var res = await _auth.LoginAsync(request);
                return Ok(res);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
        }
    }
}
