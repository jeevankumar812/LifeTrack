
namespace LifeTrack.API.DTOs.Habits;

public class HabitResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string Frequency { get; set; } = "Daily";

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool CompletedToday { get; set; }
}
