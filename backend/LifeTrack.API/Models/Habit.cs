
namespace LifeTrack.API.Models;

public class Habit
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string Frequency { get; set; } = "Daily";

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public ICollection<HabitCompletion> Completions { get; set; }
        = new List<HabitCompletion>();
}
