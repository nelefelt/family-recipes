using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace FamilyRecipes.Api.IntegrationTests.Infrastructure;

// Forces a race: runs the callback once, just before the first SaveChanges that inserts a TEntity.
// The callback plays the concurrent request that wins, for example by inserting the same row first.
public sealed class BeforeInsertInterceptor<TEntity>(Func<Task> beforeInsert) : SaveChangesInterceptor
    where TEntity : class
{
    private int _hasRun;

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        var insertsEntity = eventData.Context?.ChangeTracker
            .Entries<TEntity>()
            .Any(entry => entry.State == EntityState.Added) ?? false;

        if (insertsEntity && Interlocked.Exchange(ref _hasRun, 1) == 0)
        {
            await beforeInsert();
        }

        return result;
    }
}
