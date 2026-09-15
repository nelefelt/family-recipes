using Serilog;
using Serilog.Events;

namespace FamilyRecipes.Api.Logging;

public static class LoggingExtensions
{
    public static void CreateBootstrapLogger()
    {
        Log.Logger = new LoggerConfiguration()
            .ConfigureMinimumLevels()
            .Enrich.FromLogContext()
            .WriteTo.Console()
            .CreateBootstrapLogger();
    }

    public static IHostBuilder UseAppSerilog(this IHostBuilder hostBuilder)
    {
        return hostBuilder.UseSerilog((context, services, configuration) => configuration
            .ConfigureMinimumLevels()
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
            .WriteTo.Console());
    }

    private static LoggerConfiguration ConfigureMinimumLevels(this LoggerConfiguration configuration)
    {
        return configuration
            .MinimumLevel.Information()
            .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Warning)
            .MinimumLevel.Override("System", LogEventLevel.Warning);
    }
}
