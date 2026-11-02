
using System.ComponentModel.DataAnnotations;

namespace LifeTrack.API.DTOs.Habits;

public class UpdateHabitRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Description { get; set; }

    [Required]
    [RegularExpression("^(Daily|Weekly)$")]
    public string Frequency { get; set; } = "Daily";

    public bool IsActive { get; set; } = true;
}
