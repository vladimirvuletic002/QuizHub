using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuizHub.Models;

namespace QuizHub.Infrastructure.Configurations
{
    public class AttemptAnswerOptionConfiguration : IEntityTypeConfiguration<AttemptAnswerOption>
    {
        public void Configure(EntityTypeBuilder<AttemptAnswerOption> b)
        {
            b.HasKey(x => new { x.AttemptAnswerId, x.QuestionOptionId });

            b.HasOne(x => x.AttemptAnswer)
                .WithMany(a => a.SelectedOptions)
                .HasForeignKey(x => x.AttemptAnswerId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(x => x.QuestionOption)
                .WithMany()
                .HasForeignKey(x => x.QuestionOptionId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
