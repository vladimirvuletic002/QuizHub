using QuizHub.Models;

namespace QuizHub.Dto.Question
{
	public class QuestionResultDto
	{
		public long QuestionId { get; set; }
		public int Order { get; set; }
		public int Points { get; set; }
		public bool Correct { get; set; }
	}
}
