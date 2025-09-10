using System.Text.Json;
using BikeBuilderAPI.Model;

public static class ReviewsExporter
{
    public static void ExportReviewsToJson(AccountsContext db)
    {
        var Reviews = db.Reviews
            .ToList();

        var SaveReviews = Reviews.Select(b => new
        {
            b.ReviewId,
            b.BikePartID,
            b.Username,
            b.Rating,
            b.Description
        }).ToList();

        var json = JsonSerializer.Serialize(SaveReviews, new JsonSerializerOptions { WriteIndented = true });

        var filePath = Path.Combine("wwwroot", "reviews", "reviews.json");
        File.WriteAllText(filePath, json);
    }
}