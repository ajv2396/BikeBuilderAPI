using BikeBuilderAPI.Model;
using BikeBuilderAPI.Models;
using Microsoft.AspNetCore.Mvc;

namespace BikeBuilderAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        [HttpPost]
        public IActionResult CreateReview([FromBody] Review review)
        {
            if (review == null)
                return BadRequest(new { success = false, message = "Invalid review data." });

            using (var db = new AccountsContext())
            {
                db.Reviews.Add(review);
                db.SaveChanges();

                //Export reviews again to refresh
                ReviewsExporter.ExportReviewsToJson(db);
            }

            return Ok(new { success = true, message = "Review saved." });
        }
    }

}
