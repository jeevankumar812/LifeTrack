using System.ComponentModel.DataAnnotations;

namespace LifeTrack.API.DTOs.Profile;

public class UpdateProfileRequest
{
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string FullName { get; set; } = string.Empty;

    [Phone]
    public string? PhoneNumber { get; set; }
}