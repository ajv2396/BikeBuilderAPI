/*
    UserSaveExporter.cs

    This utility class handles exporting saved bike configurations to JSON files.
    It provides two methods: one that exports only the logged-in user's saves
    (filtered by account ID) to user_saves.json for use on the View Account page,
    and one that exports every saved bike in the database to all-saves.json for
    use on the home page background carousel. Both methods are called from
    various points in the application to keep the JSON files in sync with the database.
*/

using System.Text.Json;
using BikeBuilderAPI.Model;

public static class UserSaveExporter
{
    //for sending specific user saves to json using logged in account id
    // Exports only the saved bikes belonging to the given account ID to user_saves.json
    public static void ExportUserSavesToJson(int accountId, AccountsContext db)
    {
        // Filter saved bikes to only those belonging to the logged-in user
        var UserSaves = db.SavedBikes
            .Where(b => b.AccountId == accountId)
            .ToList();

        // Project to an anonymous type containing only the fields needed by the front end
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
    // Exports every saved bike in the database to all-saves.json for the home page background carousel
    public static void ExportAllUserSavesToJson(AccountsContext db)
    {
        // Load all saved bikes regardless of account
        var UserSaves = db.SavedBikes
            .ToList();

        // Project to an anonymous type containing only the fields needed by the front end
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
        // Written to all-saves.json rather than user_saves.json as this contains all users' bikes
        var filePath = Path.Combine("wwwroot", "all-saves.json");
        File.WriteAllText(filePath, json);
    }
}