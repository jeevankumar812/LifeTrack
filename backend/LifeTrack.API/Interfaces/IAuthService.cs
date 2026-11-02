using LifeTrack.API.DTOs.Auth;

namespace LifeTrack.API.Interfaces;

public interface IAuthService
{
    Task<(bool Success, string Message, AuthResponse? Data)>
        RegisterAsync(RegisterRequest request);

    Task<(bool Success, string Message, AuthResponse? Data)>
        LoginAsync(LoginRequest request);
}