using AutoMapper;
using QuizHub.Dto;
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
        }
    }
}
