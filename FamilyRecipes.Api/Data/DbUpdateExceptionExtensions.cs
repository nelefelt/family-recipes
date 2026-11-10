using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace FamilyRecipes.Api.Data;

public static class DbUpdateExceptionExtensions
{
    // SQL Server reports 2601 for a unique index and 2627 for a unique constraint.
    public static bool IsUniqueConstraintViolation(this DbUpdateException exception)
    {
        return exception.InnerException is SqlException { Number: 2601 or 2627 };
    }
}
