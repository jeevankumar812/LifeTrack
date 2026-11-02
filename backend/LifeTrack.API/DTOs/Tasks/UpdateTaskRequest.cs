
using System.ComponentModel.DataAnnotations;

namespace LifeTrack.API.DTOs.Tasks;

public class UpdateTaskRequest
{
    [Required]
    [StringLength(150, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public DateTime? DueDate { get; set; }

    [Required]
    [RegularExpression("^(Low|Medium|High)$")]
    public string Priority { get; set; } = "Medium";

    public bool IsCompleted { get; set; }
}
