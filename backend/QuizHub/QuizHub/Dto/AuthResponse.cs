namespace QuizHub.Dto
{
    public class AuthResponse
    {
        public long UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "User";
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAtUtc { get; set; }

        //public string ProfileImageBase64 { get; set; } = string.Empty;
    }
}
