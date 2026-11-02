
using System.ComponentModel.DataAnnotations;

namespace LifeTrack.API.DTOs.Tasks;

public class CreateTaskRequest
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
}
