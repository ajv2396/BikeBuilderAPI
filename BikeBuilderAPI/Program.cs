using BikeBuilderAPI.Model;
using Microsoft.EntityFrameworkCore;
using System.IO;

//-------------------------------CLEAR JSON FILE-------------------------------

var FilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "user_session.json");
if (File.Exists(FilePath))
{
    // clear the JSON file
    File.WriteAllText(FilePath, "{}");
}
else
{
    //create json file if it doesnt exist
    File.WriteAllText(FilePath, "{}");
}
//----------------------------------------------------------------------------

var builder = WebApplication.CreateBuilder(args);



builder.Services.AddCors();
builder.Services.AddControllers();

builder.Services.AddDbContext<AccountsContext>();

var app = builder.Build();



app.UseDefaultFiles();   // Automatically serve index.html from wwwroot
app.UseStaticFiles();    // Allow serving HTML, JS, CSS, images

app.UseCors(policy =>
    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()
);

app.UseAuthorization();

app.MapControllers();
app.Run();
