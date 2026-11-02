
namespace LifeTrack.API.Models;

public class HabitCompletion
{
    public int Id { get; set; }

    public int HabitId { get; set; }

    public DateOnly CompletionDate { get; set; }

    public DateTime CompletedAt { get; set; } = DateTime.UtcNow;

    public Habit? Habit { get; set; }
}
