
using System.Security.Claims;
using LifeTrack.API.Data;
using LifeTrack.API.DTOs.Expenses;
using LifeTrack.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LifeTrack.API.Controllers;

[ApiController]
[Route("api/expenses")]
[Authorize]
public class ExpensesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ExpensesController(AppDbContext context)
    {
        _context = context;
    }

    private string? GetUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private static ExpenseResponse ToResponse(Expense expense)
    {
        return new ExpenseResponse
        {
            Id = expense.Id,
            Title = expense.Title,
            Amount = expense.Amount,
            Type = expense.Type,
            Category = expense.Category,
            Description = expense.Description,
            TransactionDate = expense.TransactionDate,
            CreatedAt = expense.CreatedAt,
            UpdatedAt = expense.UpdatedAt
        };
    }

    // GET ALL TRANSACTIONS
    [HttpGet]
    public async Task<IActionResult> GetExpenses(
        [FromQuery] string? type,
        [FromQuery] string? category)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var query = _context.Expenses
            .Where(e => e.UserId == userId);

        if (!string.IsNullOrWhiteSpace(type))
            query = query.Where(e => e.Type == type);

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(e => e.Category == category);

        var expenses = await query
            .OrderByDescending(e => e.TransactionDate)
            .Select(e => new ExpenseResponse
            {
                Id = e.Id,
                Title = e.Title,
                Amount = e.Amount,
                Type = e.Type,
                Category = e.Category,
                Description = e.Description,
                TransactionDate = e.TransactionDate,
                CreatedAt = e.CreatedAt,
                UpdatedAt = e.UpdatedAt
            })
            .ToListAsync();

        return Ok(expenses);
    }

    // GET TRANSACTION BY ID
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetExpense(int id)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e =>
                e.Id == id && e.UserId == userId);

        if (expense == null)
            return NotFound(new { message = "Transaction not found." });

        return Ok(ToResponse(expense));
    }

    // CREATE TRANSACTION
    [HttpPost]
    public async Task<IActionResult> CreateExpense(
        [FromBody] CreateExpenseRequest request)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var transactionDate = request.TransactionDate;

        if (transactionDate.Kind == DateTimeKind.Unspecified)
        {
            transactionDate = DateTime.SpecifyKind(
                transactionDate, DateTimeKind.Utc);
        }
        else
        {
            transactionDate = transactionDate.ToUniversalTime();
        }

        var expense = new Expense
        {
            UserId = userId,
            Title = request.Title.Trim(),
            Amount = request.Amount,
            Type = request.Type,
            Category = request.Category.Trim(),
            Description = request.Description?.Trim(),
            TransactionDate = transactionDate,
            CreatedAt = DateTime.UtcNow
        };

        _context.Expenses.Add(expense);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetExpense),
            new { id = expense.Id },
            ToResponse(expense));
    }

    // UPDATE TRANSACTION
    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateExpense(
        int id,
        [FromBody] UpdateExpenseRequest request)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e =>
                e.Id == id && e.UserId == userId);

        if (expense == null)
            return NotFound(new { message = "Transaction not found." });

        var transactionDate = request.TransactionDate;

        if (transactionDate.Kind == DateTimeKind.Unspecified)
        {
            transactionDate = DateTime.SpecifyKind(
                transactionDate, DateTimeKind.Utc);
        }
        else
        {
            transactionDate = transactionDate.ToUniversalTime();
        }

        expense.Title = request.Title.Trim();
        expense.Amount = request.Amount;
        expense.Type = request.Type;
        expense.Category = request.Category.Trim();
        expense.Description = request.Description?.Trim();
        expense.TransactionDate = transactionDate;
        expense.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Transaction updated successfully.",
            data = ToResponse(expense)
        });
    }

    // DELETE TRANSACTION
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var expense = await _context.Expenses
            .FirstOrDefaultAsync(e =>
                e.Id == id && e.UserId == userId);

        if (expense == null)
            return NotFound(new { message = "Transaction not found." });

        _context.Expenses.Remove(expense);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Transaction deleted successfully."
        });
    }

    // MONTHLY SUMMARY
    [HttpGet("summary/monthly")]
    public async Task<IActionResult> GetMonthlySummary(
        [FromQuery] int year,
        [FromQuery] int month)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        if (year < 2000 || year > 9999 ||
            month < 1 || month > 12)
        {
            return BadRequest(new
            {
                message = "Invalid year or month."
            });
        }

        var startDate = new DateTime(
            year, month, 1, 0, 0, 0, DateTimeKind.Utc);

        var endDate = startDate.AddMonths(1);

        var transactions = await _context.Expenses
            .Where(e =>
                e.UserId == userId &&
                e.TransactionDate >= startDate &&
                e.TransactionDate < endDate)
            .ToListAsync();

        var income = transactions
            .Where(e => e.Type == "Income")
            .Sum(e => e.Amount);

        var expenses = transactions
            .Where(e => e.Type == "Expense")
            .Sum(e => e.Amount);

        return Ok(new MonthlySummaryResponse
        {
            Year = year,
            Month = month,
            TotalIncome = income,
            TotalExpenses = expenses,
            Balance = income - expenses,
            TotalTransactions = transactions.Count
        });
    }
}
