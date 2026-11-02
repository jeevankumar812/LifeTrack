using LifeTrack.API.Models;

namespace LifeTrack.API.Interfaces;

public interface IJwtService
{
    string GenerateToken(AppUser user);
}