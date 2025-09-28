using QuizHub.Dto.Answer;
using QuizHub.Models;

namespace QuizHub.Dto.Quiz
{
	public class SubmitQuizDto
	{
        public DateTime? StartedAtUtc { get; set; }
        public List<SubmittedAnswerDto> Answers { get; set; } = new();
	}
		    	        
}
