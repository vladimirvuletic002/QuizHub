using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuizHub.Services;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using QuizHub.Interfaces;

namespace QuizHub.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AttemptController : ControllerBase
    {
        private readonly IAttemptService _service;

        public AttemptController(IAttemptService service)
        {
            _service = service;
        }

        [HttpGet("user-attempts")]
        public async Task<IActionResult> MyAttempts()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !long.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var list = await _service.GetMyAttemptsAsync(userId);
            return Ok(list);
        }

		[HttpGet("{attId:long}")]
		public async Task<IActionResult> GetDetails(long attId){
			var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
			if (!long.TryParse(userIdStr, out var userId)) return Unauthorized();

			var details = await _service.GetAttemptDetails(attId, userId);
			if(details == null) return NotFound();
			return Ok(details);
			
		}
    }
}
