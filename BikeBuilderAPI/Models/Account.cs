/*
    Account.cs

    This model represents a registered user account in the database.
    Each account stores the user's name, email, and hashed password.
    The SavedBikes navigation property defines the one-to-many relationship
    between an account and its saved bike configurations, allowing Entity
    Framework to link all SavedBike records that belong to this account.
*/

using BikeBuilderAPI.Models;

namespace BikeBuilderAPI.Model
{
    public class Account
    {
        public int AccountId { get; set; }      // Primary key, auto-assigned by the database
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }    // Stores the SHA-256 hashed password, never plain text

        // Navigation property: allows Entity Framework to load all saved bikes linked to this account
        // Initialised to an empty list so it is never null when accessed
        public List<SavedBike> SavedBikes { get; set; } = new();
    }
}