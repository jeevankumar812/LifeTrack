
using System.ComponentModel.DataAnnotations;

namespace LifeTrack.API.DTOs.Notes;

public class CreateNoteRequest
{
    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(10000, MinimumLength = 1)]
    public string Content { get; set; } = string.Empty;

    public bool IsPinned { get; set; } = false;
}
