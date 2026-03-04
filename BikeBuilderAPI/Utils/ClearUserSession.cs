/*
    ClearUserSession.cs

    This utility class resets the user_session.json file to an empty object.
    It is called by AccountController when the user logs out. The front end
    reads user_session.json to determine login state, so writing an empty
    object causes it to treat the user as logged out and hide account-specific
    UI elements such as the basket and view account buttons.
*/

namespace BikeBuilderAPI.Utils
{
    public static class ClearUserSession
    {
        // Resets user_session.json to an empty object, creating the file if it does not exist
        public static void Clear()
        {
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
        }
    }
}