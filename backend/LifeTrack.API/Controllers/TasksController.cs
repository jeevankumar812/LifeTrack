
using System.Security.Claims;
using LifeTrack.API.Data;
using LifeTrack.API.DTOs.Tasks;
using LifeTrack.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeTrack.API.Controllers;

[ApiController]
[Route("api/tasks")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    private string GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    }

    // GET: api/tasks
    // GET: api/tasks?status=pending
    // GET: api/tasks?status=completed
    [HttpGet]
    public async Task<IActionResult> GetTasks(
        [FromQuery] string? status)
    {
        var userId = GetUserId();

        var query = _context.Tasks
            .Where(t => t.UserId == userId);

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (status.Equals(
                "pending", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(t => !t.IsCompleted);
            }
            else if (status.Equals(
                "completed", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(t => t.IsCompleted);
            }
            else
            {
                return BadRequest(new
                {
                    message = "Status must be pending or completed."
                });
            }
        }

        var tasks = await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TaskResponse
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                DueDate = t.DueDate,
                Priority = t.Priority,
                IsCompleted = t.IsCompleted,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            })
            .ToListAsync();

        return Ok(tasks);
    }

    // GET: api/tasks/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetTask(int id)
    {
        var userId = GetUserId();

        var task = await _context.Tasks
            .Where(t => t.Id == id && t.UserId == userId)
            .Select(t => new TaskResponse
            {
                Id = t.Id,
                Title = t.Title,
                Description = t.Description,
                DueDate = t.DueDate,
                Priority = t.Priority,
                IsCompleted = t.IsCompleted,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (task == null)
            return NotFound(new { message = "Task not found." });

        return Ok(task);
    }

    // POST: api/tasks
    [HttpPost]
    public async Task<IActionResult> CreateTask(
        [FromBody] CreateTaskRequest request)
    {
        var task = new TaskItem
        {
            UserId = GetUserId(),
            Title = request.Title.Trim(),
            Description = request.Description?.Trim(),
            DueDate = request.DueDate,
            Priority = request.Priority,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        var response = new TaskResponse
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            DueDate = task.DueDate,
            Priority = task.Priority,
            IsCompleted = task.IsCompleted,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt
        };

        return CreatedAtAction(
            nameof(GetTask),
            new { id = task.Id },
            response
        );
    }

    // PUT: api/tasks/1
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateTask(
        int id,
        [FromBody] UpdateTaskRequest request)
    {
        var userId = GetUserId();

        var task = await _context.Tasks
            .FirstOrDefaultAsync(t =>
                t.Id == id && t.UserId == userId);

        if (task == null)
            return NotFound(new { message = "Task not found." });

        task.Title = request.Title.Trim();
        task.Description = request.Description?.Trim();
        task.DueDate = request.DueDate;
        task.Priority = request.Priority;
        task.IsCompleted = request.IsCompleted;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Task updated successfully."
        });
    }

    // PATCH: api/tasks/1/complete
    [HttpPatch("{id:int}/complete")]
    public async Task<IActionResult> CompleteTask(int id)
    {
        var userId = GetUserId();

        var task = await _context.Tasks
            .FirstOrDefaultAsync(t =>
                t.Id == id && t.UserId == userId);

        if (task == null)
            return NotFound(new { message = "Task not found." });

        task.IsCompleted = true;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Task marked as completed."
        });
    }

    // DELETE: api/tasks/1
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var userId = GetUserId();

        var task = await _context.Tasks
            .FirstOrDefaultAsync(t =>
                t.Id == id && t.UserId == userId);

        if (task == null)
            return NotFound(new { message = "Task not found." });

        _context.Tasks.Remove(task);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Task deleted successfully."
        });
    }
}
