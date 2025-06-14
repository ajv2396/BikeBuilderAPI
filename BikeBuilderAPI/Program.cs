using BikeBuilderAPI.Model;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();
builder.Services.AddControllers();

var app = builder.Build();


app.UseDefaultFiles();   // Automatically serve index.html from wwwroot
app.UseStaticFiles();    // Allow serving HTML, JS, CSS, images

app.UseCors(policy =>
    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()
);

app.UseAuthorization();

app.MapControllers();
app.Run();
