using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using QuizHub.Models;

namespace QuizHub.Infrastructure
{
    public class QuizDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Quiz> Quizzes { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<QuestionOption> QuestionOptions { get; set; }
        public DbSet<QuestionAcceptableAnswer> QuestionAcceptableAnswers { get; set; }
        public DbSet<QuizAttempt> QuizAttempts { get; set; }
        public DbSet<AttemptAnswer> AttemptAnswers { get; set; }
        public DbSet<AttemptAnswerOption> AttemptAnswerOptions { get; set; } 
        public QuizDbContext(DbContextOptions<QuizDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            //Kazemo mu da pronadje sve konfiguracije u Assembliju i da ih primeni nad bazom
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(QuizDbContext).Assembly);
        }
    }
}
