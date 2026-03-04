/*
    Review.cs

    This model represents a user-submitted review for a specific bike part.
    Each review stores the part it relates to (BikePartID), the username of
    the reviewer (taken from the logged-in user's first and last name), a
    numeric rating from 1 to 5, and a text description. The primary key
    (ReviewId) is explicitly configured in AccountsContext.OnModelCreating
    because EF Core did not infer it automatically from this model.
*/

using BikeBuilderAPI.Model;

namespace BikeBuilderAPI.Models
{
    public class Review
    {
        public int ReviewId { get; set; }       // Primary key, explicitly configured in AccountsContext
        public int BikePartID { get; set; }     // Foreign key linking this review to a specific bike part
        public string Username { get; set; }    // Display name of the reviewer (FirstName + LastName from session)
        public int Rating { get; set; }         // Numeric rating between 1 and 5, set via the range slider in part-details.html
        public string Description { get; set; } // The reviewer's written feedback
    }
}