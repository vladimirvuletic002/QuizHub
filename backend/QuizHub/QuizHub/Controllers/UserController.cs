using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuizHub.Interfaces;

namespace QuizHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _service;

        public UserController(IUserService service)
        {
            _service = service;
        }

        [HttpGet("{id}/user")]
        public IActionResult GetUser(long id)
        {
            return Ok(_service.GetUser(id));
        }

        [HttpGet("users")]
        public IActionResult GetUsers()
        {
            return Ok(_service.GetUsers());
        }

        [HttpGet("{id}/profile-image")]
        public async Task<IActionResult> GetProfileImage(long id)
        {
            var image = await _service.GetProfileImage(id);
            if (image == null)
                return NotFound();

            return File(image.Value.Content, image.Value.ContentType);
        }
    }
}
