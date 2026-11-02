namespace LifeTrack.API.DTOs.Profile;

public class ProfileResponse
{
    public string UserId { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }

    public string? ProfilePicture { get; set; }

    public DateTime CreatedAt { get; set; }
}