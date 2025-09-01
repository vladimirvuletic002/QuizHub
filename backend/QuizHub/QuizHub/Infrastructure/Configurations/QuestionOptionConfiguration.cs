using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuizHub.Models;

namespace QuizHub.Infrastructure.Configurations
{
    public class QuestionOptionConfiguration : IEntityTypeConfiguration<QuestionOption>
    {
        public void Configure(EntityTypeBuilder<QuestionOption> b)
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Text).HasMaxLength(500).IsRequired();

            b.HasOne(x => x.Question)
             .WithMany(q => q.Options)
             .HasForeignKey(x => x.QuestionId)
             .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
