using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuizHub.Models;

namespace QuizHub.Infrastructure.Configurations
{
    public class QuestionAcceptableAnswerConfiguration : IEntityTypeConfiguration<QuestionAcceptableAnswer>
    {
        public void Configure(EntityTypeBuilder<QuestionAcceptableAnswer> b)
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.AnswerText).HasMaxLength(500).IsRequired();

            b.HasOne(x => x.Question)
             .WithMany(q => q.AcceptableAnswers)
             .HasForeignKey(x => x.QuestionId)
             .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
