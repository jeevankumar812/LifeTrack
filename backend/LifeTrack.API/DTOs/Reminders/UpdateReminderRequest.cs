
using System.ComponentModel.DataAnnotations;

namespace LifeTrack.API.DTOs.Reminders;

public class UpdateReminderRequest
{
    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    [Required]
    public DateTime ReminderDateTime { get; set; }

    [Required]
    [RegularExpression("^(Low|Medium|High)$",
        ErrorMessage = "Priority must be Low, Medium or High.")]
    public string Priority { get; set; } = "Medium";
}
