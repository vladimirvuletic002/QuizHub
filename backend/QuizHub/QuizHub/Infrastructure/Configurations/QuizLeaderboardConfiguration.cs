using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using QuizHub.Models;

namespace QuizHub.Infrastructure.Configurations
{
    public class QuizLeaderboardConfiguration : IEntityTypeConfiguration<QuizLeaderboard>
    {
        public void Configure(EntityTypeBuilder<QuizLeaderboard> b)
        {
            b.HasKey(x => new { x.QuizId, x.UserId });

            b.HasOne(x => x.Quiz)
             .WithMany()
             .HasForeignKey(x => x.QuizId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(x => x.User)
             .WithMany()
             .HasForeignKey(x => x.UserId)
             .OnDelete(DeleteBehavior.Cascade);

            // Za brza top-N čitanja po kvizu:
            b.HasIndex(x => new { x.QuizId, x.Score, x.DurationSeconds, x.CompletedAtUtc });
        }
    }
}
