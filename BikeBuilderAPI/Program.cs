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

//Export reviews on start up
using (var db = new AccountsContext())
{
    ReviewsExporter.ExportReviewsToJson(db);
}

//Export all user saves on start up
using (var db = new AccountsContext())
{
    UserSaveExporter.ExportAllUserSavesToJson(db);
}

var builder = WebApplication.CreateBuilder(args);



builder.Services.AddCors();
builder.Services.AddControllers();

builder.Services.AddDbContext<AccountsContext>();

var app = builder.Build();



app.UseDefaultFiles(); 
app.UseStaticFiles();  

app.UseCors(policy =>
    policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()
);

app.UseAuthorization();

app.MapControllers();
app.Run();
