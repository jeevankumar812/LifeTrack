
using System.Security.Claims;
using LifeTrack.API.Data;
using LifeTrack.API.DTOs.Dashboard;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeTrack.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public DashboardController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var now = DateTime.UtcNow;

        var todayStart = DateTime.SpecifyKind(
            now.Date, DateTimeKind.Utc);

        var tomorrowStart = todayStart.AddDays(1);

        var today = DateOnly.FromDateTime(now);

        var monthStart = new DateTime(
            now.Year, now.Month, 1, 0, 0, 0,
            DateTimeKind.Utc);

        var nextMonthStart = monthStart.AddMonths(1);

        // TASK SUMMARY
        var totalTasks = await _context.Tasks
            .CountAsync(t => t.UserId == userId);

        var completedTasks = await _context.Tasks
            .CountAsync(t =>
                t.UserId == userId && t.IsCompleted);

        var pendingTasks = totalTasks - completedTasks;

        var tasksDueToday = await _context.Tasks
            .CountAsync(t =>
                t.UserId == userId &&
                !t.IsCompleted &&
                t.DueDate >= todayStart &&
                t.DueDate < tomorrowStart);

        // HABIT SUMMARY
        var totalHabits = await _context.Habits
            .CountAsync(h => h.UserId == userId);

        var activeHabits = await _context.Habits
            .CountAsync(h =>
                h.UserId == userId && h.IsActive);

        var completedHabitsToday = await _context.Habits
            .Where(h =>
                h.UserId == userId &&
                h.IsActive)
            .SelectMany(h => h.Completions)
            .CountAsync(c => c.CompletionDate == today);

        var remainingHabitsToday = Math.Max(
            0, activeHabits - completedHabitsToday);

        // NOTES SUMMARY
        var totalNotes = await _context.Notes
            .CountAsync(n => n.UserId == userId);

        var pinnedNotes = await _context.Notes
            .CountAsync(n =>
                n.UserId == userId && n.IsPinned);

        // EXPENSE SUMMARY (CURRENT UTC MONTH)
        var monthlyTransactions = _context.Expenses
            .Where(e =>
                e.UserId == userId &&
                e.TransactionDate >= monthStart &&
                e.TransactionDate < nextMonthStart);

        var totalIncome = await monthlyTransactions
            .Where(e => e.Type == "Income")
            .SumAsync(e => (decimal?)e.Amount) ?? 0m;

        var totalExpenses = await monthlyTransactions
            .Where(e => e.Type == "Expense")
            .SumAsync(e => (decimal?)e.Amount) ?? 0m;

        var totalTransactions = await monthlyTransactions
            .CountAsync();

        // REMINDER SUMMARY
        var totalReminders = await _context.Reminders
            .CountAsync(r => r.UserId == userId);

        var completedReminders = await _context.Reminders
            .CountAsync(r =>
                r.UserId == userId &&
                r.IsCompleted);

        var upcomingReminders = await _context.Reminders
            .CountAsync(r =>
                r.UserId == userId &&
                !r.IsCompleted &&
                r.ReminderDateTime >= now);

        var overdueReminders = await _context.Reminders
            .CountAsync(r =>
                r.UserId == userId &&
                !r.IsCompleted &&
                r.ReminderDateTime < now);

        // FINAL DASHBOARD RESPONSE
        var dashboard = new DashboardResponse
        {
            GeneratedAt = now,

            Tasks = new TaskSummary
            {
                TotalTasks = totalTasks,
                CompletedTasks = completedTasks,
                PendingTasks = pendingTasks,
                TasksDueToday = tasksDueToday
            },

            Habits = new HabitSummary
            {
                TotalHabits = totalHabits,
                ActiveHabits = activeHabits,
                CompletedToday = completedHabitsToday,
                RemainingToday = remainingHabitsToday
            },

            Notes = new NoteSummary
            {
                TotalNotes = totalNotes,
                PinnedNotes = pinnedNotes
            },

            Expenses = new ExpenseSummary
            {
                TotalIncome = totalIncome,
                TotalExpenses = totalExpenses,
                Balance = totalIncome - totalExpenses,
                TotalTransactions = totalTransactions
            },

            Reminders = new ReminderSummary
            {
                TotalReminders = totalReminders,
                UpcomingReminders = upcomingReminders,
                OverdueReminders = overdueReminders,
                CompletedReminders = completedReminders
            }
        };

        return Ok(dashboard);
    }
}
