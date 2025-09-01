using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuizHub.Models;

namespace QuizHub.Infrastructure.Configurations
{
    public class AttemptAnswerConfiguration : IEntityTypeConfiguration<AttemptAnswer>
    {
        public void Configure(EntityTypeBuilder<AttemptAnswer> b)
        {
            b.HasKey(x => x.Id);

            b.HasOne(x => x.Attempt)
                .WithMany(a => a.Answers)
                .HasForeignKey(x => x.AttemptId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(x => x.Question)
                .WithMany()
                .HasForeignKey(x => x.QuestionId)
                .OnDelete(DeleteBehavior.Restrict);

            b.Property(x => x.AwardedPoints).HasDefaultValue(0);
        }
    }
}
