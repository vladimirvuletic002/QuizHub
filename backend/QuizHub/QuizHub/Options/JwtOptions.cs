﻿namespace QuizHub.Options
{
    public class JwtOptions
    {
        public const string SectionName = "Jwt";
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public string Key { get; set; } = string.Empty; // HMAC tajna
        public int ExpiresMinutes { get; set; } = 120;
    }
}
