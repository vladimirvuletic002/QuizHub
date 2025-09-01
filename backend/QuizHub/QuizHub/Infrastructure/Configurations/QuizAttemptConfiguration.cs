using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuizHub.Models;

namespace QuizHub.Infrastructure.Configurations
{
    public class QuizAttemptConfiguration : IEntityTypeConfiguration<QuizAttempt>
    {
        public void Configure(EntityTypeBuilder<QuizAttempt> b)
        {
            b.HasKey(x => x.Id);

            b.HasOne(x => x.Quiz)
                .WithMany(q => q.Attempts)
                .HasForeignKey(x => x.QuizId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(x => x.User)
                .WithMany(u => u.Attempts) 
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            b.Property(x => x.Score).HasDefaultValue(0);
            b.Property(x => x.MaxScore).HasDefaultValue(0);
        }
    }
}
