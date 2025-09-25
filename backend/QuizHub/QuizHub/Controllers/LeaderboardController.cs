using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuizHub.Interfaces;
using System.Security.Claims;

namespace QuizHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaderboardController : ControllerBase
    {
        private readonly ILeaderboardReadService _read;
        public LeaderboardController(ILeaderboardReadService read) { _read = read; }

        // GET /api/Leaderboard/quiz/123?page=1&pageSize=50
        [HttpGet("quiz/{quizId:long}")]
        public async Task<IActionResult> GetQuizLeaderboard(long quizId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            var rows = await _read.GetQuizLeaderboardAsync(quizId, page, pageSize);
            return Ok(rows);
        }

        [HttpGet("quiz/{quizId:long}/me")]
        public async Task<IActionResult> GetMyRank(long quizId)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();

            var userId = long.Parse(userIdStr);
            var res = await _read.GetMyPlacementdAsync(quizId, userId);
            if (res == null) return NotFound(); // korisnik nema prvi pokusaj za ovaj kviz

            return Ok(res);
        }
    }
}
