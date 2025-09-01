using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuizHub.Models;

namespace QuizHub.Infrastructure.Configurations
{
    public class QuestionConfiguration : IEntityTypeConfiguration<Question>
    {
        public void Configure(EntityTypeBuilder<Question> b)
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Text).HasMaxLength(1000).IsRequired();
            b.Property(x => x.Type).HasConversion<int>();
            b.Property(x => x.Points).HasDefaultValue(1);

            b.HasOne(x => x.Quiz)
             .WithMany(q => q.Questions)
             .HasForeignKey(x => x.QuizId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasIndex(x => new { x.QuizId, x.Order }).IsUnique(); // jedinstven redosled u kvizu
        }
    }
}
