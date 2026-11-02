
using LifeTrack.API.DTOs.Profile;
using LifeTrack.API.Interfaces;
using LifeTrack.API.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;

namespace LifeTrack.API.Services;

public class ProfileService : IProfileService
{
    private readonly UserManager<AppUser> _userManager;

    public ProfileService(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }

    // GET PROFILE
    public async Task<ProfileResponse?> GetProfileAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            return null;

        return new ProfileResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? string.Empty,
            PhoneNumber = user.PhoneNumber,
            ProfilePicture = user.ProfilePicture,
            CreatedAt = user.CreatedAt
        };
    }

    // UPDATE PROFILE
    public async Task<(bool Success, string Message)> UpdateProfileAsync(
        string userId,
        UpdateProfileRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            return (false, "User not found.");

        user.FullName = request.FullName.Trim();
        user.PhoneNumber = request.PhoneNumber?.Trim();

        var result = await _userManager.UpdateAsync(user);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ",
                result.Errors.Select(e => e.Description));

            return (false, errors);
        }

        return (true, "Profile updated successfully.");
    }

    // CHANGE PASSWORD
    public async Task<(bool Success, string Message)> ChangePasswordAsync(
        string userId,
        ChangePasswordRequest request)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            return (false, "User not found.");

        var result = await _userManager.ChangePasswordAsync(
            user,
            request.CurrentPassword,
            request.NewPassword
        );

        if (!result.Succeeded)
        {
            var errors = string.Join(", ",
                result.Errors.Select(e => e.Description));

            return (false, errors);
        }

        return (true, "Password changed successfully.");
    }

    // UPLOAD PROFILE PHOTO
    public async Task<(bool Success, string Message, string? PhotoUrl)>
        UploadProfilePhotoAsync(string userId, IFormFile file)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user == null)
            return (false, "User not found.", null);

        if (file == null || file.Length == 0)
            return (false, "Please select an image.", null);

        const long maxFileSize = 5 * 1024 * 1024;

        if (file.Length > maxFileSize)
            return (false, "Image size must be less than 5 MB.", null);

        var contentType = file.ContentType.ToLowerInvariant();

        var extension = contentType switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => null
        };

        if (extension == null)
            return (false, "Only JPG, PNG and WEBP images are allowed.", null);

        var uploadsFolder = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            "uploads",
            "profiles"
        );

        Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        try
        {
            await using (var stream = new FileStream(
                filePath,
                FileMode.CreateNew,
                FileAccess.Write))
            {
                await file.CopyToAsync(stream);
            }

            var oldPhoto = user.ProfilePicture;

            user.ProfilePicture = $"/uploads/profiles/{fileName}";

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                File.Delete(filePath);

                var errors = string.Join(", ",
                    result.Errors.Select(e => e.Description));

                return (false, errors, null);
            }

            // Delete previous profile picture
            if (!string.IsNullOrWhiteSpace(oldPhoto) &&
                oldPhoto.StartsWith(
                    "/uploads/profiles/",
                    StringComparison.Ordinal))
            {
                var oldFileName = Path.GetFileName(oldPhoto);

                if (!string.IsNullOrEmpty(oldFileName))
                {
                    var oldFilePath = Path.Combine(
                        uploadsFolder,
                        oldFileName
                    );

                    if (File.Exists(oldFilePath))
                        File.Delete(oldFilePath);
                }
            }

            return (
                true,
                "Profile picture uploaded successfully.",
                user.ProfilePicture
            );
        }
        catch (IOException)
        {
            if (File.Exists(filePath))
                File.Delete(filePath);

            return (false, "Unable to save the uploaded image.", null);
        }
    }
}
