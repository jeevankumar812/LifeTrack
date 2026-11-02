
using System.ComponentModel.DataAnnotations;

namespace LifeTrack.API.DTOs.Expenses;

public class CreateExpenseRequest
{
    [Required]
    [StringLength(150, MinimumLength = 2)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Range(typeof(decimal), "0.01", "999999999")]
    public decimal Amount { get; set; }

    [Required]
    [RegularExpression("^(Income|Expense)$",
        ErrorMessage = "Type must be Income or Expense.")]
    public string Type { get; set; } = "Expense";

    [Required]
    [StringLength(50, MinimumLength = 2)]
    public string Category { get; set; } = string.Empty;

    [StringLength(1000)]
    public string? Description { get; set; }

    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
}
