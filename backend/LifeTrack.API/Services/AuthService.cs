using LifeTrack.API.DTOs.Auth;
using LifeTrack.API.Interfaces;
using LifeTrack.API.Models;
using Microsoft.AspNetCore.Identity;

namespace LifeTrack.API.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IJwtService _jwtService;
    private readonly IConfiguration _configuration;

    public AuthService(
        UserManager<AppUser> userManager,
        IJwtService jwtService,
        IConfiguration configuration)
    {
        _userManager = userManager;
        _jwtService = jwtService;
        _configuration = configuration;
    }

    public async Task<(bool Success, string Message, AuthResponse? Data)>
        RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _userManager.FindByEmailAsync(
            request.Email
        );

        if (existingUser != null)
        {
            return (false, "Email already registered.", null);
        }

        var user = new AppUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(
            user,
            request.Password
        );

        if (!result.Succeeded)
        {
            var errors = string.Join(
                ", ",
                result.Errors.Select(e => e.Description)
            );

            return (false, errors, null);
        }

        var token = _jwtService.GenerateToken(user);

        var expiry = int.Parse(
            _configuration["Jwt:ExpiryInMinutes"] ?? "60"
        );

        var response = new AuthResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email!,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiry)
        };

        return (true, "Registration successful.", response);
    }

    public async Task<(bool Success, string Message, AuthResponse? Data)>
        LoginAsync(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(
            request.Email
        );

        if (user == null)
        {
            return (false, "Invalid email or password.", null);
        }

        var isPasswordValid = await _userManager.CheckPasswordAsync(
            user,
            request.Password
        );

        if (!isPasswordValid)
        {
            return (false, "Invalid email or password.", null);
        }

        var token = _jwtService.GenerateToken(user);

        var expiry = int.Parse(
            _configuration["Jwt:ExpiryInMinutes"] ?? "60"
        );

        var response = new AuthResponse
        {
            UserId = user.Id,
            FullName = user.FullName,
            Email = user.Email!,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expiry)
        };

        return (true, "Login successful.", response);
    }
}