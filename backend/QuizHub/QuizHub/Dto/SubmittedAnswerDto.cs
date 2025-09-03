using QuizHub.Models;

namespace QuizHub.Dto
{
	public class SubmittedAnswerDto{
		public long? QuestionId { get; set; }
		public int? Order { get; set; }

		public long? SelectedOptionId { get; set; }

		public List<long>? SelectedOptionIds { get; set; }
		

		public bool? TrueFalseAnswer { get; set; }

		public string? TextAnswer { get; set; }
	}
}
