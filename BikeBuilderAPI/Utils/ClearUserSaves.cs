/*
    ClearUserSaves.cs

    This utility class resets the user_saves.json file to an empty object.
    It is called by AccountController during logout so that the logged-out
    user's saved bike configurations are no longer accessible from the
    front end until the next successful login triggers a fresh export.
*/

namespace BikeBuilderAPI.Utils
{
    public static class ClearUserSaves
    {
        // Resets user_saves.json to an empty object, creating the file if it does not exist
        public static void Clear()
        {
            var FilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "user_saves.json");
            File.WriteAllText(FilePath, "{}");
        }
    }
}