namespace BikeBuilderAPI.Utils
{
    public static class ClearUserSession
    {
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
