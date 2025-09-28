using Microsoft.EntityFrameworkCore;
using QuizHub.Dto.Attempt;
using QuizHub.Dto.Question;
using QuizHub.Infrastructure;
using QuizHub.Interfaces;
using QuizHub.Models;

namespace QuizHub.Services
{
    public class AttemptService : IAttemptService
    {
        private readonly QuizDbContext _db;

        public AttemptService(QuizDbContext db)
        {
            _db = db;
        }

        public async Task<List<AttemptListItemDto>> GetMyAttemptsAsync(long userId)
        {
            var list = await _db.QuizAttempts
                .AsNoTracking()
                .Include(a => a.Quiz).ThenInclude(q => q.Category)
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.StartedAtUtc)
                .Select(a => new AttemptListItemDto
                {
                    AttemptId = a.Id,
                    QuizId = a.QuizId,
                    QuizTitle = a.Quiz.Title,
                    CategoryName = a.Quiz.Category != null ? a.Quiz.Category.Name : string.Empty,
                    StartedAtUtc = a.StartedAtUtc,
                    CompletedAtUtc = a.CompletedAtUtc,
                    DurationSeconds = a.CompletedAtUtc.HasValue
                        ? (int)Math.Max(0, (a.CompletedAtUtc.Value - a.StartedAtUtc).TotalSeconds)
                        : 0,
                    Score = a.Score,
                    MaxScore = a.MaxScore,
                    Percentage = a.MaxScore > 0 ? (a.Score * 100.0 / a.MaxScore) : 0.0
                })
                .ToListAsync();

            return list;
        }

        public async Task<AttemptDetailsDto> GetAttemptDetails(long attemptId, long userId){
        	var attempt = await _db.QuizAttempts
				.Include(a => a.Quiz).ThenInclude(q => q.Category)
				.Include(a => a.Answers).ThenInclude(x => x.SelectedOptions)
				.Include(a => a.Answers).ThenInclude(x => x.Question).ThenInclude(q => q.Options)
				.Include(a => a.Answers).ThenInclude(x => x.Question).ThenInclude(q => q.AcceptableAnswers)
				.AsSplitQuery()
				.FirstOrDefaultAsync(a => a.Id == attemptId && a.UserId == userId);

			if (attempt == null) return null;

			var dto = new AttemptDetailsDto{
				Questions = new List<AttemptQuestionDetailDto>(),
				Progress = new List<AttemptProgressionPointDto>()
			};

			// pitanja & odgovori
            foreach (var aa in attempt.Answers.OrderBy(x => x.Question.Order))
            {
	            var q = aa.Question;
                var qDto = new AttemptQuestionDetailDto
                {
	                QuestionId = q.Id,
                    Order = q.Order,
                    Text = q.Text,
                    Type = q.Type,
                    Points = q.Points,
                    Options = (q.Type != QuestionType.TextInput)
                        ? q.Options
                            .Select(o => new OptionDetailsDto
                            {
	                            Id = o.Id,
                                Text = o.Text,
                                IsCorrect = o.IsCorrect,
                                //Order = o.Order
                            })
                            .ToList()
                        : null,
                    AcceptableAnswers = (q.Type == QuestionType.TextInput)
                        ? q.AcceptableAnswers.Select(a => a.AnswerText).ToList()
                        : null,
                    SelectedOptionIds = aa.SelectedOptions?.Select(s => s.QuestionOptionId).ToList(),
                    TextAnswer = aa.TextAnswer,
                    IsCorrect = aa.IsCorrect,
                    AwardedPoints = aa.AwardedPoints
                };

                dto.Questions.Add(qDto);
            }
                            
            // progres za isti kviz (istorija za grafikon)
            dto.Progress = await _db.QuizAttempts
                .AsNoTracking()
                .Where(a => a.UserId == userId && a.QuizId == attempt.QuizId)
                .OrderBy(a => a.CompletedAtUtc ?? a.StartedAtUtc)
                .Select(a => new AttemptProgressionPointDto
                {
	                AttemptId = a.Id,
                    WhenUtc = a.CompletedAtUtc ?? a.StartedAtUtc,
                    Score = a.Score,
                    MaxScore = a.MaxScore
                })
                .ToListAsync();
                   
            return dto;

        }
		
		public async Task<List<AttemptListItemDto>> GetAllAttemptsAsync()
        {
	            var list = await _db.QuizAttempts
                .AsNoTracking()
                .Include(a => a.Quiz).ThenInclude(q => q.Category)
                .OrderByDescending(a => a.StartedAtUtc)
                .Select(a => new AttemptListItemDto
                {
	                AttemptId = a.Id,
					Username = a.User.Username,
                    QuizId = a.QuizId,
                    QuizTitle = a.Quiz.Title,
                    CategoryName = a.Quiz.Category != null ? a.Quiz.Category.Name : string.Empty,
                    StartedAtUtc = a.StartedAtUtc,
                    CompletedAtUtc = a.CompletedAtUtc,
                    DurationSeconds = a.CompletedAtUtc.HasValue
                        ? (int)Math.Max(0, (a.CompletedAtUtc.Value - a.StartedAtUtc).TotalSeconds)
                        : 0,
                    Score = a.Score,
                    MaxScore = a.MaxScore,
                    Percentage = a.MaxScore > 0 ? (a.Score * 100.0 / a.MaxScore) : 0.0
                })
                .ToListAsync();

            return list;
        }
           
	

    }
}
