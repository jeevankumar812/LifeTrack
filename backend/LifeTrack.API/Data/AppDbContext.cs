
using LifeTrack.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace LifeTrack.API.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<TaskItem> Tasks { get; set; }

    public DbSet<Habit> Habits { get; set; }

    public DbSet<HabitCompletion> HabitCompletions { get; set; }

    public DbSet<Note> Notes { get; set; }

    public DbSet<Expense> Expenses { get; set; }

    public DbSet<Reminder> Reminders { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // TASK CONFIGURATION
        builder.Entity<TaskItem>(entity =>
        {
            entity.ToTable("Tasks");

            entity.HasKey(t => t.Id);

            entity.Property(t => t.Title)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(t => t.Description)
                .HasMaxLength(1000);

            entity.Property(t => t.Priority)
                .HasMaxLength(20)
                .IsRequired();

            entity.HasOne<AppUser>()
                .WithMany()
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(t => t.UserId);
        });

        // HABIT CONFIGURATION
        builder.Entity<Habit>(entity =>
        {
            entity.ToTable("Habits");

            entity.HasKey(h => h.Id);

            entity.Property(h => h.Name)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(h => h.Description)
                .HasMaxLength(500);

            entity.Property(h => h.Frequency)
                .HasMaxLength(20)
                .IsRequired();

            entity.HasOne<AppUser>()
                .WithMany()
                .HasForeignKey(h => h.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(h => h.UserId);
        });

        // HABIT COMPLETION CONFIGURATION
        builder.Entity<HabitCompletion>(entity =>
        {
            entity.ToTable("HabitCompletions");

            entity.HasKey(c => c.Id);

            entity.Property(c => c.CompletionDate)
                .HasColumnType("date")
                .IsRequired();

            entity.HasOne(c => c.Habit)
                .WithMany(h => h.Completions)
                .HasForeignKey(c => c.HabitId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(c => new
            {
                c.HabitId,
                c.CompletionDate
            }).IsUnique();
        });

        // NOTE CONFIGURATION
        builder.Entity<Note>(entity =>
        {
            entity.ToTable("Notes");

            entity.HasKey(n => n.Id);

            entity.Property(n => n.Title)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(n => n.Content)
                .HasMaxLength(10000)
                .IsRequired();

            entity.Property(n => n.IsPinned)
                .HasDefaultValue(false);

            entity.Property(n => n.CreatedAt)
                .IsRequired();

            entity.HasOne<AppUser>()
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(n => n.UserId);
        });

        // EXPENSE CONFIGURATION
        builder.Entity<Expense>(entity =>
        {
            entity.ToTable("Expenses");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Title)
                .HasMaxLength(150)
                .IsRequired();

            entity.Property(e => e.Amount)
                .HasPrecision(18, 2)
                .IsRequired();

            entity.Property(e => e.Type)
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(e => e.Category)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.Description)
                .HasMaxLength(1000);

            entity.Property(e => e.TransactionDate)
                .IsRequired();

            entity.Property(e => e.CreatedAt)
                .IsRequired();

            entity.HasOne<AppUser>()
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.UserId);

            entity.HasIndex(e => new
            {
                e.UserId,
                e.TransactionDate
            });
        });


// REMINDER CONFIGURATION
builder.Entity<Reminder>(entity =>
{
    entity.ToTable("Reminders");

    entity.HasKey(r => r.Id);

    entity.Property(r => r.Title)
        .HasMaxLength(150)
        .IsRequired();

    entity.Property(r => r.Description)
        .HasMaxLength(1000);

    entity.Property(r => r.ReminderDateTime)
        .IsRequired();

    entity.Property(r => r.Priority)
        .HasMaxLength(20)
        .IsRequired();

    entity.Property(r => r.IsCompleted)
        .HasDefaultValue(false);

    entity.Property(r => r.CreatedAt)
        .IsRequired();

    entity.HasOne<AppUser>()
        .WithMany()
        .HasForeignKey(r => r.UserId)
        .OnDelete(DeleteBehavior.Cascade);

    entity.HasIndex(r => r.UserId);

    entity.HasIndex(r => new
    {
        r.UserId,
        r.ReminderDateTime
    });
});


    }
}
