using BikeBuilderAPI.Model;
using BikeBuilderAPI.Utils;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Security.Principal;

//Clear json files
ClearUserSaves.Clear();
ClearUserSession.Clear();

//Export bike parts on start up
using (var db = new AccountsContext())
{
    BikePartsExporter.ExportBikePartsToJson(db);
}


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
