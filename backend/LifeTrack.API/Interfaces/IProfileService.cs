
using LifeTrack.API.DTOs.Profile;
using Microsoft.AspNetCore.Http;

namespace LifeTrack.API.Interfaces;

public interface IProfileService
{
    // Get user profile
    Task<ProfileResponse?> GetProfileAsync(string userId);

    // Update user profile
    Task<(bool Success, string Message)> UpdateProfileAsync(
        string userId,
        UpdateProfileRequest request
    );

    // Change password
    Task<(bool Success, string Message)> ChangePasswordAsync(
        string userId,
        ChangePasswordRequest request
    );

    // Upload profile picture
    Task<(bool Success, string Message, string? PhotoUrl)>
        UploadProfilePhotoAsync(
            string userId,
            IFormFile file
        );
}
