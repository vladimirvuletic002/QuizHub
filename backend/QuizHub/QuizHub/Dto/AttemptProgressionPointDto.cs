namespace QuizHub.Dto
{
	public class AttemptProgressionPointDto()
	{
		public long AttemptId {get; set;}
		public DateTime WhenUtc {get; set;}
		public int Score {get; set;}
		public int MaxScore {get; set;}
	}
}
