/*
    Program.cs

    This is the entry point for the Bike Builder ASP.NET Core Web API.
    It performs the following tasks in order:

    1. Clears all user-specific JSON files (session, saves, basket, orders)
       so no data from a previous server session persists on startup.
    2. Exports static and semi-static data to JSON files in wwwroot so the
       front end can fetch them without making live database queries:
           - Bike parts (split into three files by bike type)
           - All reviews
           - All users' saved bikes (used by the home page background carousel)
    3. Registers application services with the dependency injection container
       (CORS, controllers, and the Entity Framework database context).
    4. Configures the HTTP request pipeline (static files, CORS, routing).
    5. Starts the web server.
*/

using BikeBuilderAPI.Model;
using BikeBuilderAPI.Utils;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Security.Principal;

// Clear all user-specific JSON files on startup so stale data from a previous
// server session cannot be read by the front end before a user logs in
//Clear json files
ClearUserSaves.Clear();
ClearUserSession.Clear();
ClearUserBasket.Clear();
ClearUserOrders.Clear();

// Export all bike parts to three separate JSON files (one per bike type)
// so the builder and part details pages can load parts without querying the database
//Export bike parts on start up
using (var db = new AccountsContext())
{
    BikePartsExporter.ExportBikePartsToJson(db);
}

// Export all reviews to reviews.json so part details pages can display
// ratings and feedback without a live database query
//Export reviews on start up
using (var db = new AccountsContext())
{
    ReviewsExporter.ExportReviewsToJson(db);
}

// Export all saved bikes across all accounts to all-saves.json
// so the home page background carousel can display community builds on load
//Export all user saves on start up
using (var db = new AccountsContext())
{
    UserSaveExporter.ExportAllUserSavesToJson(db);
}

var builder = WebApplication.CreateBuilder(args);

// Register CORS policy to allow the front end to make API requests
// (required because the front end and API run on different ports during development)
builder.Services.AddCors();

// Register controllers so ASP.NET can discover and route to them
builder.Services.AddControllers();

// Register the Entity Framework database context for dependency injection
// (used by BikesController, OrdersController etc. via constructor injection)
builder.Services.AddDbContext<AccountsContext>();

var app = builder.Build();

// Serve static files from wwwroot (HTML, CSS, JS, images, and exported JSON files)
app.UseDefaultFiles();
app.UseStaticFiles();

// Apply a permissive CORS policy allowing requests from any origin, method, and header
// This allows the JavaScript front end to call the API without browser CORS errors
app.UseCors(policy =>
    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()
);

app.UseAuthorization();

// Map controller routes so HTTP requests are dispatched to the correct controller actions
app.MapControllers();

app.Run();