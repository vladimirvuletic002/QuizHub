using AutoMapper;
using Microsoft.EntityFrameworkCore;
using QuizHub.Dto;
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
        public QuizService(QuizDbContext db, IMapper mapper) { _db = db; _mapper = mapper; }

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

            foreach (var q in dto.Questions.OrderBy(x => x.Order))
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
            }

            quiz.QuestionCount = quiz.Questions.Count;

            _db.Quizzes.Add(quiz);
            await _db.SaveChangesAsync();
            return quiz.Id;
        }

        public async Task<QuizDetailsDto?> GetQuizByIdAsync(long id)
        {
            var quiz = await _db.Quizzes
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
            };
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

            // meta
            quiz.Title = dto.Title;
            quiz.Description = dto.Description;
            quiz.CategoryId = dto.CategoryId;
            quiz.Difficulty = dto.Difficulty;
            quiz.TimeLimitSeconds = dto.TimeLimitSeconds;

            // jednostavan pristup: obriši postojeća pitanja pa upiši nova iz DTO
            _db.QuestionAcceptableAnswers.RemoveRange(quiz.Questions.SelectMany(x => x.AcceptableAnswers));
            _db.QuestionOptions.RemoveRange(quiz.Questions.SelectMany(x => x.Options));
            _db.Questions.RemoveRange(quiz.Questions);

            quiz.Questions.Clear();

            foreach (var q in dto.Questions.OrderBy(x => x.Order))
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
                }

                quiz.Questions.Add(question);
            }

            quiz.QuestionCount = quiz.Questions.Count;

            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<PagedResult<QuizListItemDto>> SearchAsync(QuizQuery query)
        {
            var q = _db.Quizzes
                .Include(x => x.Category)
                .AsQueryable();

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
                .Select(x => new QuizListItemDto
                {
                    Id = x.Id,
                    Title = x.Title,
                    CategoryName = x.Category!.Name,
                    Difficulty = x.Difficulty,
                    QuestionCount = x.QuestionCount,
                    TimeLimitSeconds = x.TimeLimitSeconds
                })
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
            var q = _db.Quizzes.Include(x => x.Category).AsQueryable();

            var total = await q.CountAsync();
            var page = Math.Max(1, 1);
            var pageSize = Math.Clamp(20, 1, 100);

            var items = await q
                .OrderBy(x => x.Title)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(x => new QuizListItemDto
                {
                    Id = x.Id,
                    Title = x.Title,
                    CategoryName = x.Category != null ? x.Category.Name : string.Empty,
                    Difficulty = x.Difficulty,
                    TimeLimitSeconds = x.TimeLimitSeconds
                })
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
            return _mapper.Map<List<QuizDto>>(_db.Quizzes.ToList());
        }

    }
}
