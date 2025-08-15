using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using QuizHub.Models;

namespace QuizHub.Infrastructure.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.HasKey(x => x.Id); //Podesavam primarni kljuc tabele

            builder.Property(x => x.Id).ValueGeneratedOnAdd();

            builder.Property(x => x.Username).HasMaxLength(30);
        }
    }
}
