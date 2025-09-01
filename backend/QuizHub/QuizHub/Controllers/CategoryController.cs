using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuizHub.Interfaces;

namespace QuizHub.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _service;

        public CategoryController(ICategoryService service)
        {
            _service = service;
        }

        [HttpGet]
        public IActionResult GetCategories()
        {
            return Ok(_service.GetCategories());
        }
    }
}
