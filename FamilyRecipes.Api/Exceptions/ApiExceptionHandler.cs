using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace FamilyRecipes.Api.Exceptions;

public class ApiExceptionHandler(ILogger<ApiExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title, detail) = exception switch
        {
            RecipeNotFoundException => (
                StatusCodes.Status404NotFound,
                "Recipe not found",
                exception.Message),
            CurrentUserIdentityException => (
                StatusCodes.Status401Unauthorized,
                "Invalid user identity",
                "A valid authenticated user identity is required."),
            _ => (
                StatusCodes.Status500InternalServerError,
                "An unexpected error occurred",
                null)
        };

        switch (exception)
        {
            case RecipeNotFoundException:
                break;
            case CurrentUserIdentityException:
                logger.LogWarning(exception, "The current user identity is invalid.");
                break;
            default:
                logger.LogError(exception, "An unexpected error occurred");
                break;
        }

        httpContext.Response.StatusCode = statusCode;

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = detail
        };

        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        return true;
    }
}
