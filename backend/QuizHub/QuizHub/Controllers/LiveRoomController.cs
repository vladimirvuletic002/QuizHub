using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuizHub.Dto.Live;
using QuizHub.Interfaces;
using QuizHub.Live;
using System.Security.Claims;

namespace QuizHub.Controllers
{
    [Authorize(Roles = "Administrator")]
    [Route("api/[controller]")]
    [ApiController]
    public class LiveRoomController : ControllerBase
    {
        private readonly IRoomManager _mgr;

        public LiveRoomController(IRoomManager mgr) { _mgr = mgr; }

        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateRoomDto dto)
        {
            var uid = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var uname = User.FindFirstValue(ClaimTypes.Name) ?? $"User{uid}";
            var code = string.IsNullOrWhiteSpace(dto.RoomCode) ? GenerateCode() : dto.RoomCode.Trim().ToUpperInvariant();

            await _mgr.CreateRoomAsync(code, dto.QuizId, uid, uname, dto.RevealSeconds);
            return Ok(new { roomCode = code });
        }

        private static string GenerateCode()
        {
            var rnd = new Random();
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            return new string(Enumerable.Range(0, 6).Select(_ => chars[rnd.Next(chars.Length)]).ToArray());
        }
    }
}
