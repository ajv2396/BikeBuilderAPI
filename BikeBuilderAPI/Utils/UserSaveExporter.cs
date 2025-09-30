using System.Text.Json;
using BikeBuilderAPI.Model;

public static class UserSaveExporter
{
    //for sending specific user saves to json using logged in account id
    public static void ExportUserSavesToJson(int accountId, AccountsContext db)
    {
        var UserSaves = db.SavedBikes
            .Where(b => b.AccountId == accountId)
            .ToList();

        var SaveItems = UserSaves.Select(b => new
        {
            b.Id,
            b.BikeType,
            b.Frame,
            b.Shock,
            b.Fork,
            b.Wheels,
            b.Tyres,
            b.Drivetrain,
            b.Brakes,
            b.Seatpost,
            b.Saddle,
            b.Bars,
            b.Stem,
            b.Pedals,
            b.SavedAt
        }).ToList();

        var json = JsonSerializer.Serialize(SaveItems, new JsonSerializerOptions { WriteIndented = true });

        var filePath = Path.Combine("wwwroot", "user_saves.json");
        File.WriteAllText(filePath, json);
    }

    //for sending all user saves to json
    public static void ExportAllUserSavesToJson(AccountsContext db)
    {
        var UserSaves = db.SavedBikes
            .ToList();

        var SaveItems = UserSaves.Select(b => new
        {
            b.Id,
            b.BikeType,
            b.Frame,
            b.Shock,
            b.Fork,
            b.Wheels,
            b.Tyres,
            b.Drivetrain,
            b.Brakes,
            b.Seatpost,
            b.Saddle,
            b.Bars,
            b.Stem,
            b.Pedals,
            b.SavedAt
        }).ToList();

        var json = JsonSerializer.Serialize(SaveItems, new JsonSerializerOptions { WriteIndented = true });

        var filePath = Path.Combine("wwwroot", "all-saves.json");
        File.WriteAllText(filePath, json);
    }
}
