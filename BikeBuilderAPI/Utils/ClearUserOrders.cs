/*
    ClearUserOrders.cs

    This utility class resets the user_orders.json file to an empty object.
    It is intended to be called when the user logs out, ensuring that order
    data from the previous session is not accessible once the session is cleared.
*/

namespace BikeBuilderAPI.Utils
{
    public static class ClearUserOrders
    {
        // Resets user_orders.json to an empty object, creating the file if it does not exist
        public static void Clear()
        {
            var FilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "user_orders.json");
            File.WriteAllText(FilePath, "{}");
        }
    }
}