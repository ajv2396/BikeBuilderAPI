/*
    ReviewsExporter.cs

    This utility class exports all reviews from the database to a single JSON
    file at wwwroot/reviews/reviews.json. It is called by ReviewsController
    immediately after a new review is saved, so the front end always has an
    up-to-date reviews file without needing to query the database directly.
    All reviews across all parts and bike types are included in one file;
    the front end filters by BikePartID when displaying reviews for a specific part.
*/

using System.Text.Json;
using BikeBuilderAPI.Model;

public static class ReviewsExporter
{
    // Queries all reviews from the database and writes them to reviews.json
    public static void ExportReviewsToJson(AccountsContext db)
    {
        // Load all reviews regardless of part or bike type
        var Reviews = db.Reviews
            .ToList();

        // Project to an anonymous type containing only the fields needed by the front end
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