using QuizHub.Models;

namespace QuizHub.Dto
{
	public class SubmitQuizDto
	{
        public DateTime? StartedAtUtc { get; set; }
        public List<SubmittedAnswerDto> Answers { get; set; } = new();
	}
		    	        
}
