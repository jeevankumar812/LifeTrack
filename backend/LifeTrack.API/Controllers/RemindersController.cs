
using System.Security.Claims;
using LifeTrack.API.Data;
using LifeTrack.API.DTOs.Reminders;
using LifeTrack.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeTrack.API.Controllers;

[ApiController]
[Route("api/reminders")]
[Authorize]
public class RemindersController : ControllerBase
{
    private readonly AppDbContext _context;

    public RemindersController(AppDbContext context)
    {
        _context = context;
    }

    private string? GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private static DateTime ToUtc(DateTime dateTime)
    {
        if (dateTime.Kind == DateTimeKind.Unspecified)
        {
            return DateTime.SpecifyKind(dateTime, DateTimeKind.Utc);
        }

        return dateTime.ToUniversalTime();
    }

    private static ReminderResponse ToResponse(Reminder reminder)
    {
        return new ReminderResponse
        {
            Id = reminder.Id,
            Title = reminder.Title,
            Description = reminder.Description,
            ReminderDateTime = reminder.ReminderDateTime,
            Priority = reminder.Priority,
            IsCompleted = reminder.IsCompleted,
            CreatedAt = reminder.CreatedAt,
            UpdatedAt = reminder.UpdatedAt
        };
    }

    // GET: api/reminders
    // GET: api/reminders?status=upcoming
    // GET: api/reminders?status=completed
    // GET: api/reminders?status=overdue
    [HttpGet]
    public async Task<IActionResult> GetReminders(
        [FromQuery] string? status)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var query = _context.Reminders
            .Where(r => r.UserId == userId);

        var now = DateTime.UtcNow;

        if (!string.IsNullOrWhiteSpace(status))
        {
            switch (status.ToLowerInvariant())
            {
                case "upcoming":
                    query = query.Where(r =>
                        !r.IsCompleted &&
                        r.ReminderDateTime >= now);
                    break;

                case "completed":
                    query = query.Where(r => r.IsCompleted);
                    break;

                case "overdue":
                    query = query.Where(r =>
                        !r.IsCompleted &&
                        r.ReminderDateTime < now);
                    break;

                default:
                    return BadRequest(new
                    {
                        message = "Status must be upcoming, completed or overdue."
                    });
            }
        }

        var reminders = await query
            .OrderBy(r => r.ReminderDateTime)
            .Select(r => new ReminderResponse
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                ReminderDateTime = r.ReminderDateTime,
                Priority = r.Priority,
                IsCompleted = r.IsCompleted,
                CreatedAt = r.CreatedAt,
                UpdatedAt = r.UpdatedAt
            })
            .ToListAsync();

        return Ok(reminders);
    }

    // GET: api/reminders/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetReminder(int id)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var reminder = await _context.Reminders
            .FirstOrDefaultAsync(r =>
                r.Id == id && r.UserId == userId);

        if (reminder == null)
        {
            return NotFound(new
            {
                message = "Reminder not found."
            });
        }

        return Ok(ToResponse(reminder));
    }

    // POST: api/reminders
    [HttpPost]
    public async Task<IActionResult> CreateReminder(
        [FromBody] CreateReminderRequest request)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var reminder = new Reminder
        {
            UserId = userId,
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            ReminderDateTime = ToUtc(request.ReminderDateTime),
            Priority = request.Priority,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reminders.Add(reminder);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetReminder),
            new { id = reminder.Id },
            ToResponse(reminder));
    }

    // PUT: api/reminders/1
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateReminder(
        int id,
        [FromBody] UpdateReminderRequest request)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var reminder = await _context.Reminders
            .FirstOrDefaultAsync(r =>
                r.Id == id && r.UserId == userId);

        if (reminder == null)
        {
            return NotFound(new
            {
                message = "Reminder not found."
            });
        }

        reminder.Title = request.Title.Trim();
        reminder.Description = request.Description?.Trim();
        reminder.ReminderDateTime = ToUtc(request.ReminderDateTime);
        reminder.Priority = request.Priority;
        reminder.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Reminder updated successfully.",
            data = ToResponse(reminder)
        });
    }

    // PATCH: api/reminders/1/complete
    [HttpPatch("{id:int}/complete")]
    public async Task<IActionResult> CompleteReminder(int id)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var reminder = await _context.Reminders
            .FirstOrDefaultAsync(r =>
                r.Id == id && r.UserId == userId);

        if (reminder == null)
        {
            return NotFound(new
            {
                message = "Reminder not found."
            });
        }

        if (reminder.IsCompleted)
        {
            return BadRequest(new
            {
                message = "Reminder is already completed."
            });
        }

        reminder.IsCompleted = true;
        reminder.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Reminder marked as completed successfully."
        });
    }

    // PATCH: api/reminders/1/incomplete
    [HttpPatch("{id:int}/incomplete")]
    public async Task<IActionResult> UndoCompleteReminder(int id)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var reminder = await _context.Reminders
            .FirstOrDefaultAsync(r =>
                r.Id == id && r.UserId == userId);

        if (reminder == null)
        {
            return NotFound(new
            {
                message = "Reminder not found."
            });
        }

        if (!reminder.IsCompleted)
        {
            return BadRequest(new
            {
                message = "Reminder is already incomplete."
            });
        }

        reminder.IsCompleted = false;
        reminder.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Reminder marked as incomplete successfully."
        });
    }

    // DELETE: api/reminders/1
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteReminder(int id)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var reminder = await _context.Reminders
            .FirstOrDefaultAsync(r =>
                r.Id == id && r.UserId == userId);

        if (reminder == null)
        {
            return NotFound(new
            {
                message = "Reminder not found."
            });
        }

        _context.Reminders.Remove(reminder);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Reminder deleted successfully."
        });
    }
}
