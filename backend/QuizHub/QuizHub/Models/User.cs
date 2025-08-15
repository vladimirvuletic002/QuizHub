using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuizHub.Models
{
    public class User
    {
        public long Id { get; set; }
        public string Username { get; set; }

        public string Password { get; set; }

        public string Email { get; set; }

        // Skladistenje slike u bazi kao byte[]
        public byte[]? ProfileImage { get; set; }

        public UserType UserType { get; set; }
    }
}
