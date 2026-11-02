
using System.Security.Claims;
using LifeTrack.API.DTOs.Profile;
using LifeTrack.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace LifeTrack.API.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    private string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    }

    // GET: api/profile
    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var profile = await _profileService.GetProfileAsync(GetUserId());

        if (profile == null)
            return NotFound(new { message = "User not found." });

        return Ok(profile);
    }

    // PUT: api/profile
    [HttpPut]
    public async Task<IActionResult> UpdateProfile(
        [FromBody] UpdateProfileRequest request)
    {
        var result = await _profileService.UpdateProfileAsync(
            GetUserId(), request);

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    // PUT: api/profile/change-password
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest request)
    {
        var result = await _profileService.ChangePasswordAsync(
            GetUserId(), request);

        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    // POST: api/profile/photo
    [HttpPost("photo")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadPhoto(
        [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new
            {
                message = "Please select a profile picture."
            });
        }

        var result = await _profileService.UploadProfilePhotoAsync(
            GetUserId(), file);

        if (!result.Success)
        {
            return BadRequest(new
            {
                message = result.Message
            });
        }

        return Ok(new
        {
            message = result.Message,
            photoUrl = result.PhotoUrl
        });
    }
}
