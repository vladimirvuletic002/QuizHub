using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuizHub.Models;

namespace QuizHub.Infrastructure.Configurations
{
    public class QuizConfiguration : IEntityTypeConfiguration<Quiz>
    {
        public void Configure(EntityTypeBuilder<Quiz> b)
        {
            b.HasKey(x => x.Id);
            b.Property(x => x.Title).HasMaxLength(150).IsRequired();
            b.Property(x => x.Description).HasMaxLength(1000);
            b.Property(x => x.TimeLimitSeconds).HasDefaultValue(0);
            b.Property(x => x.Difficulty).HasConversion<int>();
            b.Property(x => x.QuestionCount).HasDefaultValue(0);

            b.HasIndex(t => t.Title).IsUnique();

            b.HasOne(x => x.Category)
             .WithMany(c => c.Quizzes)
             .HasForeignKey(x => x.CategoryId)
             .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
