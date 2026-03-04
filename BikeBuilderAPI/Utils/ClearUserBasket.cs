/*
    ClearUserBasket.cs

    This utility class resets the user's basket JSON file to an empty array.
    It is called by BasketController after a successful order is placed during
    checkout, ensuring the basket is cleared on the server so the front end
    reflects an empty basket on next load. Writing "[]" rather than "{}" is
    intentional because the basket file stores a JSON array of bike items.
*/

namespace BikeBuilderAPI.Utils
{
    public static class ClearUserBasket
    {
        // Resets user-basket.json to an empty array, creating the file if it does not exist
        public static void Clear()
        {
            var FilePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "basket", "user-basket.json");

            if (File.Exists(FilePath))
            {
                // clear the JSON file
                File.WriteAllText(FilePath, "[]");
            }
            else
            {
                //create json file if it doesnt exist
                File.WriteAllText(FilePath, "[]");
            }
        }
    }
}