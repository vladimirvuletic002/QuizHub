namespace QuizHub.Live
{
    public class Participant
    {
        public long UserId { get; set; }
        public string Username { get; set; } = "";
        public bool IsAdmin { get; set; }
        public string? ConnectionId { get; set; }
    }
}
