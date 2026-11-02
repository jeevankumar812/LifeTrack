
namespace LifeTrack.API.DTOs.Expenses;

public class MonthlySummaryResponse
{
    public int Year { get; set; }

    public int Month { get; set; }

    public decimal TotalIncome { get; set; }

    public decimal TotalExpenses { get; set; }

    public decimal Balance { get; set; }

    public int TotalTransactions { get; set; }
}
