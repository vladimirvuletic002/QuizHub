using AutoMapper;
using QuizHub.Dto.Auth;
using QuizHub.Dto.Category;
using QuizHub.Dto.Question;
using QuizHub.Dto.Quiz;
using QuizHub.Dto.User;
using QuizHub.Models;

namespace QuizHub.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile() 
        {
            CreateMap<User, RegisterDto>().ForMember(d => d.Password, o => o.Ignore())
            .ForMember(d => d.ProfileImage, o => o.Ignore()).ReverseMap();

            CreateMap<User, UserDto>().ReverseMap();

            CreateMap<Quiz, QuizDto>().ReverseMap();

            CreateMap<Category, CategoryNameDto>().ReverseMap();

            CreateMap<QuestionOption, OptionDetailsDto>();


            CreateMap<Quiz, QuizListItemDto>()
            .ForMember(d => d.CategoryName, m => m.MapFrom(s => s.Category != null ? s.Category.Name : null));

            CreateMap<Quiz, QuizDetailsDto>()
            .ForMember(d => d.CategoryName, m => m.MapFrom(s => s.Category != null ? s.Category.Name : null))
            .ForMember(d => d.Questions, m => m.MapFrom(s => s.Questions));

            CreateMap<Question, QuestionDetailsDto>()
           .ForMember(d => d.Options, m => m.MapFrom(s =>
               s.Type == QuestionType.TextInput ? null : s.Options))
           .ForMember(d => d.AcceptableAnswers, m => m.MapFrom(s =>
               s.Type == QuestionType.TextInput ? s.AcceptableAnswers.Select(a => a.AnswerText).ToList() : null));

            // ------WRITE DTO-> Entity------
            CreateMap<CreateQuizDto, Quiz>()
            .ForMember(d => d.Id, m => m.Ignore())
            .ForMember(d => d.QuestionCount, m => m.MapFrom(s => s.Questions.Count))
            .ForMember(d => d.Questions, m => m.MapFrom(s => s.Questions));

            CreateMap<CreateQuestionDto, Question>()
            .ForMember(d => d.Id, m => m.Ignore())
            .ForMember(d => d.Options, m => m.MapFrom(s =>
                s.Type == QuestionType.TextInput ? null : s.Options))
            .ForMember(d => d.AcceptableAnswers, m => m.MapFrom(s =>
                s.Type == QuestionType.TextInput && s.AcceptableAnswers != null
                    ? s.AcceptableAnswers.Select(a => new QuestionAcceptableAnswer { AnswerText = a.Trim() })
                    : new List<QuestionAcceptableAnswer>()));

            CreateMap<CreateOptionDto, QuestionOption>()
            .ForMember(d => d.Id, m => m.Ignore());

            CreateMap<UpdateQuizDto, Quiz>()
            .ForMember(d => d.Id, m => m.Ignore())
            .ForMember(d => d.Questions, m => m.Ignore())
            .ForMember(d => d.QuestionCount, m => m.Ignore());

        }
    }
}
