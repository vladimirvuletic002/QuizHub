using QuizHub.Dto.Question;
using QuizHub.Models;

namespace QuizHub.Dto.Quiz
{
	public class QuizSubmitResultDto
	{
		public long QuizId { get; set; }
		public long UserId { get; set; }
		public int Score { get; set; }
		public int MaxScore { get; set; }
        public List<QuestionResultDto> Questions { get; set; } = new();
	}
}
