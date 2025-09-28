namespace QuizHub.Dto.Live
{
    public class TickDto { public int Left { get; set; } }
    public class RevealDto { } // proširi po želji (npr. prave odgovore)
    public class ScoresRowDto { public long UserId { get; set; } public string Username { get; set; } = ""; public int Score { get; set; } }
    public class LeaderboardDto { public List<ScoresRowDto> Rows { get; set; } = new(); }
}
