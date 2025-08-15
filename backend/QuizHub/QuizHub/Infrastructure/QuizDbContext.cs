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
