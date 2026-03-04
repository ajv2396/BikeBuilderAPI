/*
    ReviewController.cs

    This controller handles the submission of new part reviews.
    It exposes a single POST endpoint that accepts a review object,
    saves it to the database, and then re-exports all reviews to the
    reviews JSON file so the front end immediately reflects the new review
    without needing a full server restart.
*/

using BikeBuilderAPI.Model;
using BikeBuilderAPI.Models;
using Microsoft.AspNetCore.Mvc;

namespace BikeBuilderAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        // Saves a new review to the database and refreshes the reviews JSON file
        [HttpPost]
        public IActionResult CreateReview([FromBody] Review review)
        {
            // Return 400 if the request body could not be deserialised to a Review object
            if (review == null)
                return BadRequest(new { success = false, message = "Invalid review data." });

            using (var db = new AccountsContext())
            {
                db.Reviews.Add(review);
                db.SaveChanges();

                // Re-export all reviews to reviews.json so the front end reflects the new review immediately
                //Export reviews again to refresh
                ReviewsExporter.ExportReviewsToJson(db);
            }

            return Ok(new { success = true, message = "Review saved." });
        }
    }
}