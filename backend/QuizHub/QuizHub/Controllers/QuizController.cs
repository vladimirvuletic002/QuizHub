using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuizHub.Dto;
using QuizHub.Interfaces;
using System.Security.Claims;

namespace QuizHub.Controllers
{
    //[Authorize(Roles = "Administrator")]
    [Route("api/[controller]")]
    [ApiController]
    public class QuizController : ControllerBase
    {
        private readonly IQuizService _quizService;

        public QuizController(IQuizService quizService)
        {
            _quizService = quizService;
        }

		[Authorize(Roles = "Administrator")]
        [HttpPost("create")]
        public async Task<IActionResult> Create([FromBody] CreateQuizDto dto)
        {
            var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var id = await _quizService.CreateQuizAsync(dto, userId);
            return CreatedAtAction(nameof(GetById), new { id }, new { id });
        }

        // READ (GET by id) — svi
        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var quiz = await _quizService.GetQuizByIdAsync(id);
            if (quiz == null) return NotFound();
            return Ok(quiz);
        }

        // UPDATE (PUT) — admin
        [HttpPut("{id:long}/update")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Update(long id, [FromBody] UpdateQuizDto dto)
        {
            if (!ModelState.IsValid) return ValidationProblem(ModelState);

            try
            {
                var ok = await _quizService.UpdateQuizAsync(id, dto);
                if (!ok) return NotFound();
                return NoContent(); // 204
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE — admin
        [HttpDelete("{id:long}/delete")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> Delete(long id)
        {
            var ok = await _quizService.DeleteQuizAsync(id);
            if (!ok) return NotFound();
            return NoContent(); // 204
        }

        // LIST / SEARCH (GET sa filterima) — svi
        // /api/quizzes?categoryId=1&difficulty=2&q=programiranje&page=1&pageSize=20
        [HttpGet("filter")]
        public async Task<IActionResult> Search([FromQuery] QuizQuery query)
        {
            var res = await _quizService.SearchAsync(query);
            return Ok(res);
        }

        [HttpGet("quizzes")]
        public async Task<IActionResult> GetAllQuizzes()
        {
            var list = await _quizService.GetAllQuizzesAsync();
            return Ok(list);
        }

        [HttpPost("{id:long}/submit")]
        [Authorize]
        public async Task<IActionResult> Submit(long id, [FromBody] SubmitQuizDto submission)
        {
            var userId = long.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var res = await _quizService.SubmitQuizAsync(id, userId, submission);
            return Ok(res);
        }

    }
}
