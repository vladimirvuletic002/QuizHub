using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuizHub.Models
{
    public class User
    {
        public long Id { get; set; }
        public string Username { get; set; } = string.Empty;

        public string Password { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

        // Skladistenje slike u bazi kao byte[]
        public byte[]? ProfileImage { get; set; }

        public string? ProfileImageContentType { get; set; }

        public UserType UserType { get; set; }

        public ICollection<QuizAttempt> Attempts { get; set; } = new List<QuizAttempt>();
    }
}
