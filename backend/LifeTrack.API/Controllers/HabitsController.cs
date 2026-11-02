
using System.Security.Claims;
using LifeTrack.API.Data;
using LifeTrack.API.DTOs.Habits;
using LifeTrack.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeTrack.API.Controllers;

[ApiController]
[Route("api/habits")]
[Authorize]
public class HabitsController : ControllerBase
{
    private readonly AppDbContext _context;

    public HabitsController(AppDbContext context)
    {
        _context = context;
    }

    private string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    }

    private static DateOnly Today =>
        DateOnly.FromDateTime(DateTime.UtcNow);

    // GET: api/habits
    [HttpGet]
    public async Task<IActionResult> GetHabits()
    {
        var userId = GetUserId();
        var today = Today;

        var habits = await _context.Habits
            .Where(h => h.UserId == userId)
            .OrderByDescending(h => h.CreatedAt)
            .Select(h => new HabitResponse
            {
                Id = h.Id,
                Name = h.Name,
                Description = h.Description,
                Frequency = h.Frequency,
                IsActive = h.IsActive,
                CreatedAt = h.CreatedAt,
                CompletedToday = h.Completions.Any(
                    c => c.CompletionDate == today)
            })
            .ToListAsync();

        return Ok(habits);
    }

    // GET: api/habits/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetHabit(int id)
    {
        var userId = GetUserId();
        var today = Today;

        var habit = await _context.Habits
            .Where(h => h.Id == id && h.UserId == userId)
            .Select(h => new HabitResponse
            {
                Id = h.Id,
                Name = h.Name,
                Description = h.Description,
                Frequency = h.Frequency,
                IsActive = h.IsActive,
                CreatedAt = h.CreatedAt,
                CompletedToday = h.Completions.Any(
                    c => c.CompletionDate == today)
            })
            .FirstOrDefaultAsync();

        if (habit == null)
            return NotFound(new { message = "Habit not found." });

        return Ok(habit);
    }

    // POST: api/habits
    [HttpPost]
    public async Task<IActionResult> CreateHabit(
        [FromBody] CreateHabitRequest request)
    {
        var habit = new Habit
        {
            UserId = GetUserId(),
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Frequency = request.Frequency,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Habits.Add(habit);

        await _context.SaveChangesAsync();

        var response = new HabitResponse
        {
            Id = habit.Id,
            Name = habit.Name,
            Description = habit.Description,
            Frequency = habit.Frequency,
            IsActive = habit.IsActive,
            CreatedAt = habit.CreatedAt,
            CompletedToday = false
        };

        return CreatedAtAction(
            nameof(GetHabit),
            new { id = habit.Id },
            response
        );
    }

    // PUT: api/habits/1
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateHabit(
        int id,
        [FromBody] UpdateHabitRequest request)
    {
        var habit = await _context.Habits
            .FirstOrDefaultAsync(h =>
                h.Id == id && h.UserId == GetUserId());

        if (habit == null)
            return NotFound(new { message = "Habit not found." });

        habit.Name = request.Name.Trim();
        habit.Description = request.Description?.Trim();
        habit.Frequency = request.Frequency;
        habit.IsActive = request.IsActive;
        habit.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Habit updated successfully."
        });
    }

    // DELETE: api/habits/1
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteHabit(int id)
    {
        var habit = await _context.Habits
            .FirstOrDefaultAsync(h =>
                h.Id == id && h.UserId == GetUserId());

        if (habit == null)
            return NotFound(new { message = "Habit not found." });

        _context.Habits.Remove(habit);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Habit deleted successfully."
        });
    }

    // POST: api/habits/1/complete
    // Optional date: ?date=2026-11-02
    [HttpPost("{id:int}/complete")]
    public async Task<IActionResult> CompleteHabit(
        int id,
        [FromQuery] DateOnly? date)
    {
        var userId = GetUserId();
        var completionDate = date ?? Today;

        if (completionDate > Today)
        {
            return BadRequest(new
            {
                message = "Future habit completion is not allowed."
            });
        }

        var habit = await _context.Habits
            .FirstOrDefaultAsync(h =>
                h.Id == id &&
                h.UserId == userId &&
                h.IsActive);

        if (habit == null)
            return NotFound(new { message = "Active habit not found." });

        var alreadyCompleted = await _context.HabitCompletions
            .AnyAsync(c =>
                c.HabitId == id &&
                c.CompletionDate == completionDate);

        if (alreadyCompleted)
        {
            return Ok(new
            {
                message = "Habit is already completed for this date."
            });
        }

        var completion = new HabitCompletion
        {
            HabitId = id,
            CompletionDate = completionDate,
            CompletedAt = DateTime.UtcNow
        };

        _context.HabitCompletions.Add(completion);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Habit completed successfully.",
            habitId = id,
            completionDate
        });
    }

    // DELETE: api/habits/1/complete
    // Optional date: ?date=2026-11-02
    [HttpDelete("{id:int}/complete")]
    public async Task<IActionResult> UndoCompletion(
        int id,
        [FromQuery] DateOnly? date)
    {
        var userId = GetUserId();
        var completionDate = date ?? Today;

        var habitExists = await _context.Habits
            .AnyAsync(h =>
                h.Id == id && h.UserId == userId);

        if (!habitExists)
            return NotFound(new { message = "Habit not found." });

        var completion = await _context.HabitCompletions
            .FirstOrDefaultAsync(c =>
                c.HabitId == id &&
                c.CompletionDate == completionDate);

        if (completion == null)
        {
            return NotFound(new
            {
                message = "Completion record not found."
            });
        }

        _context.HabitCompletions.Remove(completion);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Habit completion removed successfully."
        });
    }

    // GET: api/habits/1/progress?days=30
    [HttpGet("{id:int}/progress")]
    public async Task<IActionResult> GetHabitProgress(
        int id,
        [FromQuery] int days = 30)
    {
        if (days < 1 || days > 365)
        {
            return BadRequest(new
            {
                message = "Days must be between 1 and 365."
            });
        }

        var userId = GetUserId();

        var habit = await _context.Habits
            .FirstOrDefaultAsync(h =>
                h.Id == id && h.UserId == userId);

        if (habit == null)
            return NotFound(new { message = "Habit not found." });

        var today = Today;
        var startDate = today.AddDays(-(days - 1));

        var completedDates = await _context.HabitCompletions
            .Where(c =>
                c.HabitId == id &&
                c.CompletionDate >= startDate &&
                c.CompletionDate <= today)
            .Select(c => c.CompletionDate)
            .OrderBy(d => d)
            .ToListAsync();

        var completedSet = completedDates.ToHashSet();

        var completedDays = completedDates.Count;

        var percentage = Math.Round(
            (double)completedDays / days * 100,
            2
        );

        // Calculate current streak.
        // If today is not completed, yesterday can keep the streak alive.
        var currentStreak = 0;

        var streakDate = completedSet.Contains(today)
            ? today
            : today.AddDays(-1);

        while (completedSet.Contains(streakDate))
        {
            currentStreak++;
            streakDate = streakDate.AddDays(-1);
        }

        // Calculate longest streak within the selected period.
        var longestStreak = 0;
        var runningStreak = 0;
        DateOnly? previousDate = null;

        foreach (var completedDate in completedDates)
        {
            if (previousDate.HasValue &&
                completedDate == previousDate.Value.AddDays(1))
            {
                runningStreak++;
            }
            else
            {
                runningStreak = 1;
            }

            longestStreak = Math.Max(
                longestStreak,
                runningStreak
            );

            previousDate = completedDate;
        }

        var response = new HabitProgressResponse
        {
            HabitId = habit.Id,
            HabitName = habit.Name,
            TotalDays = days,
            CompletedDays = completedDays,
            CompletionPercentage = percentage,
            CurrentStreak = currentStreak,
            LongestStreak = longestStreak,
            CompletedDates = completedDates
        };

        return Ok(response);
    }
}
