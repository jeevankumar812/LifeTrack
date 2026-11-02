
namespace LifeTrack.API.DTOs.Dashboard;

public class DashboardResponse
{
    public DateTime GeneratedAt { get; set; }

    public TaskSummary Tasks { get; set; } = new();

    public HabitSummary Habits { get; set; } = new();

    public NoteSummary Notes { get; set; } = new();

    public ExpenseSummary Expenses { get; set; } = new();

    public ReminderSummary Reminders { get; set; } = new();
}

public class TaskSummary
{
    public int TotalTasks { get; set; }

    public int CompletedTasks { get; set; }

    public int PendingTasks { get; set; }

    public int TasksDueToday { get; set; }
}

public class HabitSummary
{
    public int TotalHabits { get; set; }

    public int ActiveHabits { get; set; }

    public int CompletedToday { get; set; }

    public int RemainingToday { get; set; }
}

public class NoteSummary
{
    public int TotalNotes { get; set; }

    public int PinnedNotes { get; set; }
}

public class ExpenseSummary
{
    public decimal TotalIncome { get; set; }

    public decimal TotalExpenses { get; set; }

    public decimal Balance { get; set; }

    public int TotalTransactions { get; set; }
}

public class ReminderSummary
{
    public int TotalReminders { get; set; }

    public int UpcomingReminders { get; set; }

    public int OverdueReminders { get; set; }

    public int CompletedReminders { get; set; }
}
