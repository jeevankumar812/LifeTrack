
namespace LifeTrack.API.Models;

public class Expense
{
    public int Id { get; set; }

    public string UserId { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    // Income or Expense
    public string Type { get; set; } = "Expense";

    public string Category { get; set; } = string.Empty;

    public string? Description { get; set; }

    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}
