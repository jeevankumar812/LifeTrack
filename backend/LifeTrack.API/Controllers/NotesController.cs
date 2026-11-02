
using System.Security.Claims;
using LifeTrack.API.Data;
using LifeTrack.API.DTOs.Notes;
using LifeTrack.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeTrack.API.Controllers;

[ApiController]
[Route("api/notes")]
[Authorize]
public class NotesController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotesController(AppDbContext context)
    {
        _context = context;
    }

    private string? GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    // GET: api/notes
    // GET: api/notes?search=meeting
    // GET: api/notes?pinned=true
    [HttpGet]
    public async Task<IActionResult> GetNotes(
        [FromQuery] string? search,
        [FromQuery] bool? pinned)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var query = _context.Notes
            .Where(n => n.UserId == userId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();

            query = query.Where(n =>
                EF.Functions.ILike(n.Title, $"%{term}%") ||
                EF.Functions.ILike(n.Content, $"%{term}%"));
        }

        if (pinned.HasValue)
        {
            query = query.Where(n => n.IsPinned == pinned.Value);
        }

        var notes = await query
            .OrderByDescending(n => n.IsPinned)
            .ThenByDescending(n => n.UpdatedAt ?? n.CreatedAt)
            .Select(n => new NoteResponse
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                IsPinned = n.IsPinned,
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt
            })
            .ToListAsync();

        return Ok(notes);
    }

    // GET: api/notes/1
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetNote(int id)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var note = await _context.Notes
            .Where(n => n.Id == id && n.UserId == userId)
            .Select(n => new NoteResponse
            {
                Id = n.Id,
                Title = n.Title,
                Content = n.Content,
                IsPinned = n.IsPinned,
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt
            })
            .FirstOrDefaultAsync();

        if (note == null)
            return NotFound(new { message = "Note not found." });

        return Ok(note);
    }

    // POST: api/notes
    [HttpPost]
    public async Task<IActionResult> CreateNote(
        [FromBody] CreateNoteRequest request)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var note = new Note
        {
            UserId = userId,
            Title = request.Title.Trim(),
            Content = request.Content.Trim(),
            IsPinned = request.IsPinned,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notes.Add(note);
        await _context.SaveChangesAsync();

        var response = new NoteResponse
        {
            Id = note.Id,
            Title = note.Title,
            Content = note.Content,
            IsPinned = note.IsPinned,
            CreatedAt = note.CreatedAt,
            UpdatedAt = note.UpdatedAt
        };

        return CreatedAtAction(
            nameof(GetNote),
            new { id = note.Id },
            response);
    }

    // PUT: api/notes/1
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateNote(
        int id,
        [FromBody] UpdateNoteRequest request)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var note = await _context.Notes
            .FirstOrDefaultAsync(n =>
                n.Id == id && n.UserId == userId);

        if (note == null)
            return NotFound(new { message = "Note not found." });

        note.Title = request.Title.Trim();
        note.Content = request.Content.Trim();
        note.IsPinned = request.IsPinned;
        note.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Note updated successfully."
        });
    }

    // DELETE: api/notes/1
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteNote(int id)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var note = await _context.Notes
            .FirstOrDefaultAsync(n =>
                n.Id == id && n.UserId == userId);

        if (note == null)
            return NotFound(new { message = "Note not found." });

        _context.Notes.Remove(note);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Note deleted successfully."
        });
    }
}
