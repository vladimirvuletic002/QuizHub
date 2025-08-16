using System.ComponentModel.DataAnnotations;

namespace QuizHub.Dto
{
    public class RegisterDto
    {
        [Required, MaxLength(30)]
        public string Username { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required, MinLength(8), MaxLength(100)]
        public string Password { get; set; } = string.Empty;

        // multipart/form-data:
        public IFormFile? ProfileImage { get; set; }
    }
}
