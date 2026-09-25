using FamilyRecipes.Api.Authentication;
using FamilyRecipes.Api.Data;
using FamilyRecipes.Api.Exceptions;
using FamilyRecipes.Api.Logging;
using FamilyRecipes.Api.Repositories;
using FamilyRecipes.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Serilog;

LoggingExtensions.CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseAppSerilog();

    builder.Services.AddOpenApi();
    builder.Services.AddControllers();
    builder.Services.AddExceptionHandler<ApiExceptionHandler>();
    builder.Services.AddProblemDetails();

    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

    builder.Services.AddScoped<IRecipeRepository, RecipeRepository>();
    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IRecipeService, RecipeService>();
    builder.Services.AddScoped<IUserService, UserService>();

    builder.Services.AddHttpContextAccessor();

    builder.Services.AddScoped<
        ICurrentUserContext,
        CurrentUserContext>();

    builder.Services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddMicrosoftIdentityWebApi(
            builder.Configuration.GetSection("AzureAd"));

    builder.Services.AddAuthorization();

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("Frontend", policy =>
        {
            policy
                .WithOrigins("http://localhost:3000")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
    });

    var app = builder.Build();

    app.UseSerilogRequestLogging();
    app.UseExceptionHandler();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();

        app.UseSwaggerUI(options =>
        {
            options.SwaggerEndpoint("/openapi/v1.json", "v1");
            options.RoutePrefix = "swagger";
        });

        await using var scope = app.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await DevelopmentDataSeeder.SeedAsync(dbContext, app.Lifetime.ApplicationStopping);
    }

    app.UseHttpsRedirection();
    app.UseCors("Frontend");
    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception exception)
{
    Log.Fatal(exception, "Application terminated unexpectedly");
    throw;
}
finally
{
    await Log.CloseAndFlushAsync();
}
