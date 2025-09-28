using QuizHub.Dto.Question;
using QuizHub.Models;

namespace QuizHub.Dto.Attempt
{
	public class AttemptQuestionDetailDto()
	{
		public long QuestionId {get; set;}
		public long Order {get; set;}
		public string Text {get; set;} = string.Empty;
		public QuestionType Type {get; set;}
		public int Points {get; set;}

		public List<OptionDetailsDto>? Options { get; set; }     // za Single/Multiple/TF
		public List<string>? AcceptableAnswers { get; set; }     // za TextInput

		// korisnikovi odgovori:
		public List<long>? SelectedOptionIds { get; set; }       // Single/Multiple/TF
		public string? TextAnswer { get; set; }                  // TextInput

		public bool? IsCorrect { get; set; }
		public int AwardedPoints { get; set; }
	}
}
