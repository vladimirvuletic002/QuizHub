namespace QuizHub.Dto.Live
{
    public class CreateRoomDto
    {
        public long QuizId { get; set; }
        public string RoomCode { get; set; } = string.Empty; // ili generisi na serveru
        public int RevealSeconds { get; set; } = 5;
    }
}
