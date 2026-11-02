
namespace LifeTrack.API.DTOs.Habits;

public class HabitProgressResponse
{
    public int HabitId { get; set; }

    public string HabitName { get; set; } = string.Empty;

    public int TotalDays { get; set; }

    public int CompletedDays { get; set; }

    public double CompletionPercentage { get; set; }

    public int CurrentStreak { get; set; }

    public int LongestStreak { get; set; }

    public List<DateOnly> CompletedDates { get; set; } = new();
}
