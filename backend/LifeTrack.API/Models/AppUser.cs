using Microsoft.AspNetCore.Identity;

namespace LifeTrack.API.Models;

public class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;

    public string? ProfilePicture { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}