using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using QuizHub.Dto.Question;
using QuizHub.Dto.Quiz;
using QuizHub.Infrastructure;
using QuizHub.Interfaces;
using QuizHub.Models;
using System.Drawing;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace QuizHub.Services
{
    public class QuizService : IQuizService
    {
        private readonly QuizDbContext _db;
        private readonly IMapper _mapper;
        private readonly ILeaderboardService _leaderboard;
        public QuizService(QuizDbContext db, IMapper mapper, ILeaderboardService leaderboard) { _db = db; _mapper = mapper; _leaderboard = leaderboard; }

        public async Task<long> CreateQuizAsync(CreateQuizDto dto, long createdByUserId)
        {
            // (opciono) validacije: postoji li CategoryId, da li je admin itd.
            if (await _db.Quizzes.AnyAsync(q => q.Title == dto.Title))
                throw new InvalidOperationException("Quiz Title already exists.");

            var quiz = new Quiz
            {
                Title = dto.Title,
                Description = dto.Description,
                CategoryId = dto.CategoryId,
                Difficulty = dto.Difficulty,
                TimeLimitSeconds = dto.TimeLimitSeconds
            };

            /*foreach (var q in dto.Questions.OrderBy(x => x.Order))
            {
                var question = new Question
                {
                    Text = q.Text,
                    Type = q.Type,
                    Order = q.Order,
                    Points = q.Points,
                    TimeLimitSeconds = q.TimeLimitSeconds
                };

                if (q.Type == QuestionType.TextInput)
                {
                    if (q.AcceptableAnswers != null)
                    {
                        foreach (var a in q.AcceptableAnswers.Where(s => !string.IsNullOrWhiteSpace(s)))
                        {
                            question.AcceptableAnswers.Add(new QuestionAcceptableAnswer
                            {
                                AnswerText = a.Trim()
                            });
                        }
                    }
                }
                else
                {
                    if (q.Options == null || q.Options.Count == 0)
                        throw new InvalidOperationException("Options are required for non-text questions.");

                    foreach (var opt in q.Options)
                    {
                        question.Options.Add(new QuestionOption
                        {
                            Text = opt.Text,
                            IsCorrect = opt.IsCorrect
                        });
                    }
                }

                quiz.Questions.Add(question);
            } */

            foreach (var q in dto.Questions)
            {
                if (q.Type != QuestionType.TextInput && (q.Options == null || q.Options.Count == 0))
                    throw new InvalidOperationException("Options are required for non-text questions.");
            }

            var entity = _mapper.Map<Quiz>(dto);               
            entity.QuestionCount = entity.Questions.Count;

            //quiz.QuestionCount = quiz.Questions.Count;

            _db.Quizzes.Add(entity);
            await _db.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<QuizDetailsDto?> GetQuizByIdAsync(long id)
        {
            /*(var quiz = await _db.Quizzes
                .Include(q => q.Category)
                .Include(q => q.Questions).ThenInclude(qq => qq.Options)
                .Include(q => q.Questions).ThenInclude(qq => qq.AcceptableAnswers)
                .FirstOrDefaultAsync(q => q.Id == id);



            if (quiz == null) return null;

            return new QuizDetailsDto
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Description = quiz.Description,
                Difficulty = quiz.Difficulty,
                TimeLimitSeconds = quiz.TimeLimitSeconds,
                CategoryId = quiz.CategoryId,
                CategoryName = quiz.Category?.Name ?? "",
                QuestionCount = quiz.Questions.Count,
                Questions = quiz.Questions
                    .OrderBy(x => x.Order)
                    .Select(x => new QuestionDetailsDto
                    {
                        Id = x.Id,
                        Text = x.Text,
                        Type = x.Type,
                        Order = x.Order,
                        Points = x.Points,
                        TimeLimitSeconds = x.TimeLimitSeconds,
                        Options = (x.Type == QuestionType.TextInput) ? null
                            : x.Options.Select(o => new OptionDetailsDto
                            {
                                Id = o.Id,
                                Text = o.Text,
                                IsCorrect = o.IsCorrect
                            }).ToList(),
                        AcceptableAnswers = (x.Type == QuestionType.TextInput)
                            ? x.AcceptableAnswers.Select(a => a.AnswerText).ToList()
                            : null
                    }).ToList()
            };  */

            var quiz = await _db.Quizzes
                .AsNoTracking()
                .Include(q => q.Category)
                .Include(q => q.Questions).ThenInclude(qq => qq.Options)
                .Include(q => q.Questions).ThenInclude(qq => qq.AcceptableAnswers)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (quiz == null) return null;

            // Mapiranje u memoriji (bez EF-projekcije)
            var dto = _mapper.Map<QuizDetailsDto>(quiz);

            // Ako ti je bitan redosled pitanja, ovde ga garantuj:
            dto.Questions = dto.Questions.OrderBy(x => x.Order).ToList();


            return dto;
        }


        public async Task<bool> DeleteQuizAsync(long id)
        {
            var quiz = await _db.Quizzes.FirstOrDefaultAsync(q => q.Id == id);
            if (quiz == null) return false;

            _db.Quizzes.Remove(quiz);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateQuizAsync(long id, UpdateQuizDto dto)
        {
            var quiz = await _db.Quizzes
                .Include(q => q.Questions).ThenInclude(q => q.Options)
                .Include(q => q.Questions).ThenInclude(q => q.AcceptableAnswers)
                .FirstOrDefaultAsync(q => q.Id == id);

            if (quiz == null) return false;

            // 1) mapiraj META polja (Title/Description/Category/Difficulty/TimeLimitSeconds)
            _mapper.Map(dto, quiz);

            // meta
            quiz.Title = dto.Title;
            quiz.Description = dto.Description;
            quiz.CategoryId = dto.CategoryId;
            quiz.Difficulty = dto.Difficulty;
            quiz.TimeLimitSeconds = dto.TimeLimitSeconds;

            // 2) da li postoje pokušaji za ovaj kviz
            var hasAttempts =
                await _db.AttemptAnswers.AnyAsync(a => a.Question.QuizId == id)
                || await _db.AttemptAnswerOptions.AnyAsync(ao => ao.QuestionOption.Question.QuizId == id);

            if (hasAttempts)
            {
                // BEZ destruktivnih izmena — sačuvaj samo meta
                await _db.SaveChangesAsync();
                return true;
            }

            // 3) nema pokušaja → možeš primeniti "delete and recreate"
            _db.QuestionAcceptableAnswers.RemoveRange(quiz.Questions.SelectMany(x => x.AcceptableAnswers).ToList());
            _db.QuestionOptions.RemoveRange(quiz.Questions.SelectMany(x => x.Options).ToList());
            _db.Questions.RemoveRange(quiz.Questions.ToList());

            quiz.Questions.Clear();

            await _db.SaveChangesAsync();

            foreach (var qDto in dto.Questions.OrderBy(x => x.Order))
            {
                /*var question = new Question
                {
                    Text = q.Text,
                    Type = q.Type,
                    Order = q.Order,
                    Points = q.Points,
                    TimeLimitSeconds = q.TimeLimitSeconds
                };

                if (q.Type == QuestionType.TextInput)
                {
                    if (q.AcceptableAnswers != null)
                    {
                        foreach (var a in q.AcceptableAnswers.Where(s => !string.IsNullOrWhiteSpace(s)))
                            question.AcceptableAnswers.Add(new QuestionAcceptableAnswer { AnswerText = a.Trim() });
                    }
                }
                else
                {
                    if (q.Options == null || q.Options.Count == 0)
                        throw new InvalidOperationException("Options are required for non-text questions.");

                    foreach (var opt in q.Options)
                    {
                        question.Options.Add(new QuestionOption
                        {
                            Text = opt.Text,
                            IsCorrect = opt.IsCorrect
                        });
                    }
                } */

                // dodatna validacija
                if (qDto.Type != QuestionType.TextInput && (qDto.Options == null || qDto.Options.Count == 0))
                    throw new InvalidOperationException("Options are required for non-text questions.");

                var question = _mapper.Map<Question>(qDto); // CreateMap<CreateQuestionDto, Question>
                quiz.Questions.Add(question);

            }

            quiz.QuestionCount = quiz.Questions.Count;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<PagedResult<QuizListItemDto>> SearchAsync(QuizQuery query)
        {
            var q = _db.Quizzes.AsNoTracking();
                //.Include(x => x.Category)
                //.AsQueryable();

            if (query.CategoryId.HasValue)
                q = q.Where(x => x.CategoryId == query.CategoryId.Value);

            if (query.Difficulty.HasValue)
                q = q.Where(x => x.Difficulty == query.Difficulty.Value);

            if (!string.IsNullOrWhiteSpace(query.KeyWord))
            {
                var term = query.KeyWord.Trim();
                q = q.Where(x => x.Title.Contains(term));
            }

            var total = await q.CountAsync();

            var page = Math.Max(1, query.Page);
            var size = Math.Clamp(query.PageSize, 1, 100);

            var items = await q
                .OrderBy(x => x.Title)
                .Skip((page - 1) * size)
                .Take(size)
                .ProjectTo<QuizListItemDto>(_mapper.ConfigurationProvider)
                /*.Select(x => new QuizListItemDto
                {
                    Id = x.Id,
                    Title = x.Title,
                    CategoryName = x.Category!.Name,
                    Difficulty = x.Difficulty,
                    QuestionCount = x.QuestionCount,
                    TimeLimitSeconds = x.TimeLimitSeconds
                })*/
                .ToListAsync(); 

            return new PagedResult<QuizListItemDto>
            {
                Page = page,
                PageSize = size,
                Total = total,
                Items = items
            };
        }

        public async Task<PagedResult<QuizListItemDto>> GetAllQuizzesAsync()
        {
            var q = _db.Quizzes.AsNoTracking(); //Include(x => x.Category).AsQueryable();

            var total = await q.CountAsync();
            var page = Math.Max(1, 1);
            var pageSize = Math.Clamp(20, 1, 100);

            var items = await q
                .OrderBy(x => x.Title)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ProjectTo<QuizListItemDto>(_mapper.ConfigurationProvider)
                /*.Select(x => new QuizListItemDto
                {
                    Id = x.Id,
                    Title = x.Title,
                    CategoryName = x.Category != null ? x.Category.Name : string.Empty,
                    Difficulty = x.Difficulty,
                    TimeLimitSeconds = x.TimeLimitSeconds
                }) */
                .ToListAsync();

            return new PagedResult<QuizListItemDto>
            {
                Page = page,
                PageSize = pageSize,
                Total = total,
                Items = items
            };
        }


        public async Task<List<QuizDto>> GetQuizzes()
        {
            var entities = await _db.Quizzes
                .Include(q => q.Category)
                .Include(q => q.Questions)
                .ToListAsync();

            return _mapper.Map<List<QuizDto>>(entities);
        }

        public async Task<QuizSubmitResultDto> SubmitQuizAsync(long quizId, long userId, SubmitQuizDto submission)
        {
            var quiz = await _db.Quizzes
                .Include(q => q.Questions).ThenInclude(x => x.Options)
                .Include(q => q.Questions).ThenInclude(x => x.AcceptableAnswers)
                .FirstOrDefaultAsync(q => q.Id == quizId);

            if (quiz == null)
                throw new KeyNotFoundException("Quiz not found.");

            
            var byQuestionId = quiz.Questions.ToDictionary(x => x.Id, x => x);

            int totalScore = 0;
            int maxScore = 0;
            var perQuestion = new List<QuestionResultDto>();

            string Norm(string? s) => (s ?? string.Empty).Trim().ToLowerInvariant();

            var attempt = new QuizAttempt
            {
                QuizId = quiz.Id,
                UserId = userId,
                StartedAtUtc = submission.StartedAtUtc ?? DateTime.UtcNow,
                CompletedAtUtc = DateTime.UtcNow
            };

            foreach (var q in quiz.Questions.OrderBy(x => x.Order))
            {
                maxScore += q.Points;

                var sub = submission.Answers
                    .FirstOrDefault(a => a.QuestionId.HasValue && a.QuestionId.Value == q.Id);

                bool correct = false;
                int awarded = 0;

                var attemptAnswer = new AttemptAnswer
                {
                    QuestionId = q.Id
                };

                if (sub != null)
                {
                    switch (q.Type)
                    {
                        case QuestionType.SingleChoice:
                            {
                                // očekuje se jedan ID tačne opcije
                                if (sub.SelectedOptionId.HasValue)
                                {
                                    var chosen = q.Options.FirstOrDefault(o => o.Id == sub.SelectedOptionId.Value);

                                    if(chosen != null)
                                    {
                                        attemptAnswer.SelectedOptions.Add(new AttemptAnswerOption
                                        {
                                            QuestionOptionId = chosen.Id
                                        });
                                        correct = chosen?.IsCorrect == true;
                                    }
                                    
                                }
                                break;
                            }

                        case QuestionType.MultipleChoice:
                            {
                                // očekuje se lista ID-jeva
                                var correctIds = new HashSet<long>(q.Options.Where(o => o.IsCorrect).Select(o => o.Id));
                                var chosenIds = new HashSet<long>(sub.SelectedOptionIds ?? Enumerable.Empty<long>());

                                foreach (var optId in chosenIds)
                                {
                                    // validacija postojanja opcije
                                    if (q.Options.Any(o => o.Id == optId))
                                    {
                                        attemptAnswer.SelectedOptions.Add(new AttemptAnswerOption
                                        {
                                            QuestionOptionId = optId
                                        });
                                    }
                                }

                                // tačno ako su skupovi identični
                                correct = correctIds.SetEquals(chosenIds);
                                break;
                            }

                        case QuestionType.TrueFalse:
                            {
                                // očekuje se bool
                                if (sub.TrueFalseAnswer.HasValue)
                                {
                                    // pronađi koja je TF opcija tačna: pretpostavka — imaš dve opcije, jedna IsCorrect = true
                                    // (nije nužno da proveravaš tekst; dovoljno je da znaš koja je tačna)
                                    var trueOption = q.Options.FirstOrDefault(o =>
                                        o.Text.Equals("Tačno", StringComparison.OrdinalIgnoreCase) ||
                                        o.Text.Equals("Tacno", StringComparison.OrdinalIgnoreCase));
                                    var falseOption = q.Options.FirstOrDefault(o =>
                                        o.Text.Equals("Netačno", StringComparison.OrdinalIgnoreCase) ||
                                        o.Text.Equals("Netacno", StringComparison.OrdinalIgnoreCase));

                                    // ako nema eksplicitnog teksta, fallback: tačna je ona sa IsCorrect = true
                                    bool isTrueCorrect =
                                        (trueOption?.IsCorrect == true) ||
                                        (trueOption == null && falseOption == null && q.Options.Any(o => o.IsCorrect));

                                    // upisi i izabranu opciju (po tekstu ili logici)
                                    var picked = sub.TrueFalseAnswer.Value ? trueOption : falseOption;
                                    if (picked != null)
                                    {
                                        attemptAnswer.SelectedOptions.Add(new AttemptAnswerOption
                                        {
                                            QuestionOptionId = picked.Id
                                        });
                                    }

                                    correct = sub.TrueFalseAnswer.Value == isTrueCorrect;
                                }
                                break;
                            }

                        case QuestionType.TextInput:
                            {
                                var acceptable = q.AcceptableAnswers.Select(a => Norm(a.AnswerText)).ToHashSet();
                                var userText = sub.TextAnswer ?? "";
                                attemptAnswer.TextAnswer = userText;
                                correct = acceptable.Contains(Norm(sub.TextAnswer));
                                break;
                            }
                    }
                }

                if (correct)
                    awarded = q.Points;

                attemptAnswer.IsCorrect = correct;
                attemptAnswer.AwardedPoints = awarded;
                attempt.Answers.Add(attemptAnswer);

                totalScore += awarded;

                perQuestion.Add(new QuestionResultDto
                {
                    QuestionId = q.Id,
                    Order = q.Order,
                    Points = q.Points,
                    Correct = correct
                });
            }

            attempt.Score = totalScore;
            attempt.MaxScore = maxScore;

            // 3) Snimi u bazu
            _db.QuizAttempts.Add(attempt);
            await _db.SaveChangesAsync();

            await _leaderboard.InsertFirstAttemptOnlyAsync(
                quiz.Id,
                userId,
                totalScore,
                maxScore,
                durationSeconds: attempt.CompletedAtUtc.HasValue
                    ? (int?)Math.Max(0, (attempt.CompletedAtUtc.Value - attempt.StartedAtUtc).TotalSeconds)
                    : null,
                attemptId: attempt.Id,
                completedAtUtc: attempt.CompletedAtUtc ?? DateTime.UtcNow
            );

            return new QuizSubmitResultDto
            {
                QuizId = quiz.Id,
                UserId = userId,
                Score = totalScore,
                MaxScore = maxScore,
                Questions = perQuestion
            };
        }
    }
}
