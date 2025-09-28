namespace QuizHub.Dto.Attempt
{
	public class AttemptDetailsDto()
	{
		public List<AttemptQuestionDetailDto> Questions {get; set;} = new();
		public List<AttemptProgressionPointDto> Progress {get; set;} = new();
	}
}
