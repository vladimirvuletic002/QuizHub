using System.ComponentModel.DataAnnotations;

namespace QuizHub.Models
{
    public class Category
    {
        public long Id { get; set; }

        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        public ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
    }
}
